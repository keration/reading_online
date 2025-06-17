// src/utils/request.ts

import type {AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/UserStore';
import router from '@/router';



const baseURL = "/api";

// 定义接口返回数据的通用结构
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 创建axios实例
const instance: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true // 必须允许跨域携带Cookie
});

const getCsrfToken = (): string | null => {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === 'XSRF-TOKEN') {
      return decodeURIComponent(value); // 关键：解码 URLEncoded 字符（如 %3D 转为 =）
    }
  }
  return null;
};



// 请求拦截器
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore();
    const method = config.method?.toLowerCase();

    // 添加 Authorization
    if (userStore.token) {
      config.headers.set('Authorization', `Bearer ${userStore.token}`);
    }

    // 处理 Content-Type
    if (config.headers.get('Content-Type') === 'multipart/form-data' || config.data instanceof FormData) {
      config.headers.delete('Content-Type');
    }

    return config; // ✅ 必须返回 config
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

interface CustomError extends Error {
  code?: string | number;
  status?: number;
  config?: AxiosRequestConfig;
  isAxiosError?: boolean;
}

instance.interceptors.response.use(
  response => {
    // 1. 处理二进制响应（网页1方案扩展）
    const contentType = response.headers?.['content-type']?.toLowerCase();
    if (/application\/(octet-stream|pdf|zip)/.test(contentType)) {
      return response;
    }

    // 2. 统一数据结构处理（网页4标准化方案）
    // const { code, data, message } = response.data || {};
    
    // 3. 业务状态码验证（网页6错误处理逻辑）
    // if (code !== 200) {
    //   const error = new Error(message || '业务逻辑错误') as CustomError;
    //   error.code = code || 'UNKNOWN_CODE';
    //   error.status = response.status;
    //   throw error;
    // }
    return response.data; // 剥离数据包装
    
  },
  error => {
    // 4. 统一错误标准化（网页6最佳实践）
    const normalizedError: CustomError = {
      code: error.response?.data?.code || 'NETWORK_ERROR',
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      isAxiosError: axios.isAxiosError(error),
      name: ''
    };

    // 5. 特殊场景处理（网页4扩展方案）
    if (error.response?.headers['x-csrf-error']) {
      normalizedError.code = 'CSRF_TOKEN_INVALID';
      normalizedError.message = '安全令牌失效，请刷新页面重试';
      setTimeout(window.location.reload, 2000);
    }

    // 6. 状态码映射处理（网页6逻辑优化）
    const errorHandler = new Map<number, () => void>([
      [401, () => {
        useUserStore().logout();
        router.replace(`/login?redirect=${encodeURIComponent(router.currentRoute.value.fullPath)}`);
      }],
      [403, () => ElMessage.error(`权限不足：${normalizedError.message}`)],
      [429, () => ElMessage.warning('操作频繁，请稍后再试')]
    ]);

    if (typeof normalizedError.status === 'number') {
      errorHandler.get(normalizedError.status)?.();
    }
    ElMessage.closeAll();
    ElMessage.error(normalizedError.message);
    
    return Promise.reject(normalizedError);
  }
);



// 封装常用请求方法
export const get = <T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> =>
  instance.get(url, { params, ...config });

export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
  instance.post(url, data, config);

export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
  instance.put(url, data, config);

export const del = <T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> =>
  instance.delete(url, { params, ...config });

// 文件上传专用实例（可选）
// 在 uploadInstance 中添加进度监听
export const uploadInstance: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'multipart/form-data'
  },
  onUploadProgress: (progressEvent) => {
    const percent = Math.round(
      (progressEvent.loaded * 100) / progressEvent.total!
    );
    // 可在 Vue 组件中监听自定义事件
    window.dispatchEvent(new CustomEvent('upload-progress', { detail: percent }));
  }
});

// 添加上传取消功能[7](@ref)
const cancelTokenMap = new Map();
export const cancelableUpload = (file: File, cancelKey: string) => {
  const source = axios.CancelToken.source();
  cancelTokenMap.set(cancelKey, source);
  
  const formData = new FormData();
  formData.append('file', file);

  return uploadInstance.post('/upload', formData, {
    cancelToken: source.token
  });
};

export default instance;
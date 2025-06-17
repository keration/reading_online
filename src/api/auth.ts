// ===================== 数据模型接口 =====================
export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export interface LoginResponse {
    token: string;
    username: string;
    role: string;
    expiresIn: number;  // 服务器返回的秒级过期时间
  }
  
  // ===================== API 调用函数 =====================
  import axios from 'axios';
  
  const API_BASE_URL = '/api';
  
  export const AuthApi = {
    
    //   用户登录
    //   @param request 包含用户名和密码的登录请求
    //   @returns 包含JWT令牌和用户信息的响应
    
    login: (request: LoginRequest) => {
      return axios.post<LoginResponse>(
        `${API_BASE_URL}/auth/login`,
        request,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  };
  

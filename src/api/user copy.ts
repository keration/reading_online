import request from '@/utils/request'

export const userRegisterService = (registerForm) =>{

    const params = new URLSearchParams()
    for (let key in registerForm) {
        params.append(key,registerForm[key]);
    }
    return request.post('/user/register',params);
}

export const userLoginService = (loginForm) =>{

    const params = new URLSearchParams()
    for (let key in loginForm) {
        params.append(key,loginForm[key]);
    }
    return request.post('/user/login',params);
}
// ===================== 数据模型接口 =====================
export interface UserRegisterRequest {
    username: string;
    password: string;
    email: string;
    // 根据实际DTO可能包含的其他字段
    nickname?: string;
    phone?: string;
  }
  
  export interface UserResponse {
    id: number;
    username: string;
    email: string;
    createdAt: string;       // ISO 格式时间字符串
    lastLoginAt?: string | null;
    avatarUrl?: string;
  }
  
  // 通用API响应结构
  export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
  }
  
  // ===================== API 调用函数 =====================
  import axios from 'axios';
  
  const API_BASE_URL = '/api';
  
  export const UserApi = {
    // /​**​
    //  * 用户注册
    //  * @param userData 注册信息
    //  * @returns 包含用户信息的响应
    //  */
    register: (userData: UserRegisterRequest) => 
      axios.post<ApiResponse<UserResponse>>(
        `${API_BASE_URL}/users/register`,
        userData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
  };
  
 
  const validatePassword = (password: string) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(password);
  };
  
  // 2. 自动处理日期字段
  axios.interceptors.response.use(response => {
    if (response.data?.data?.createdAt) {
      response.data.data.createdAt = new Date(response.data.data.createdAt);
    }
    return response;
  });
  
  // 3. 注册参数预校验
  export const safeRegister = async (data: UserRegisterRequest) => {
    if (!validatePassword(data.password)) {
      throw new Error('密码需包含字母、数字和特殊字符，至少8位');
    }
    return UserApi.register(data);
  };
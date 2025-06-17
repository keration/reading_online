// @/types/error.ts
export class CustomError extends Error {
  constructor(
    public message: string,
    public code?: string | number,  // 业务错误码
    public status?: number,         // HTTP状态码
    public config?: {               // 请求配置
      url?: string; 
      method?: string;
      params?: any 
    },
    public details?: any            // 原始错误数据
  ) {
    super(message);
    this.name = "CustomError";
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, CustomError);
    }
  }
}
// API 响应数据结构
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// 自定义错误类
export class APIError extends Error {
  constructor(message: string, public code?: string, public status?: number) {
    super(message);
    this.name = "APIError";
  }
}

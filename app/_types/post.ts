// 定义付费内容状态枚举
export enum PostStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

// 定义付费内容类型接口
export interface Post {
  id: string;
  title: string;
  image: string;
  price: string;
  tokenAddress: string;
  chainId: number;
  ownerAddress: string;
  status?: PostStatus;
  createdAt?: string;
  updatedAt?: string;
}

// 定义表单数据类型接口
export interface PostFormData {
  id?: string;
  title: string;
  image: string;
  price: string;
  tokenAddress: string;
  chainId: string | number;
  ownerAddress: string;
  status?: PostStatus;
}

// 定义 API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code?: string;
    message: string;
  };
}

// 自定义错误类
export class PostError extends Error {
  constructor(message: string, public code?: string, public status?: number) {
    super(message);
    this.name = "PostError";
  }
}

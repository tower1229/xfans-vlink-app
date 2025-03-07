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
  price: string | bigint;
  image: string;
  tokenAddress: string;
  ownerAddress: string;
  chainId: number;
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

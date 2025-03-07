import { Post } from "./post";
import { User } from "./user";
import { ApiResponse } from "./api";

export interface Order {
  id: string;
  postId: string;
  userId: string;
  amount: string | bigint;
  status: OrderStatus;
  txHash: string | null;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  post?: Post;
  user?: User;
}

// 订单状态枚举
export enum OrderStatus {
  PENDING = 0,
  COMPLETED = 1,
  EXPIRED = 2,
  FAILED = 3,
  CLOSED = 4,
}

// 订单状态文本映射
export const OrderStatusMap: { [key in OrderStatus]: string } = {
  [OrderStatus.PENDING]: "待支付",
  [OrderStatus.COMPLETED]: "已完成",
  [OrderStatus.EXPIRED]: "已过期",
  [OrderStatus.FAILED]: "已失败",
  [OrderStatus.CLOSED]: "已关闭",
};

// 订单列表响应接口
export interface OrderListResponse {
  orders: Order[];
  total: number;
}

// 分页信息
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

// 订单列表 API 响应
export interface OrdersResponse
  extends ApiResponse<{
    orders: Order[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  }> {}

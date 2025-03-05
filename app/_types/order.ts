// API 响应中的订单类型
export interface ApiOrder {
  id: string;
  user: {
    username: string;
    id: string;
  };
  price: number;
  status: 0 | 1 | 2 | 3 | 4; // 使用 OrderStatus 中定义的所有状态值
  createdAt: string;
  userAddress: string;
  productId: string;
  transactionHash: string | null;
}

// 分页信息
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

// API 响应数据结构
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// 订单列表 API 响应
export interface OrdersResponse
  extends ApiResponse<{
    orders: ApiOrder[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  }> {}

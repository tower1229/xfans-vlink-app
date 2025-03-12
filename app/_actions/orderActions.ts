import { fetchWithAuth } from "@/_utils/api";
import { Order, OrderStatus, OrdersResponse } from "@/_types/order";
import { ApiResponse } from "@/_types/api";
import { ActionPostResponse } from "@/_types/vlink";

/**
 * 获取订单列表
 * @param status 订单状态
 * @param page 当前页码
 * @param pageSize 每页条数
 * @returns 订单列表和分页信息
 */
export const fetchOrders = async (
  status: OrderStatus | "all" = "all",
  page: number = 1,
  pageSize: number = 10
): Promise<{
  orders: Order[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}> => {
  try {
    // Build the API URL with status filter and pagination
    let url = `/api/v1/orders?page=${page}&pageSize=${pageSize}`;

    // Add status filter if not "all"
    if (status !== "all") {
      url += `&status=${status.toString()}`;
    }

    const response = await fetchWithAuth<OrdersResponse>(url);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || "Failed to fetch orders");
    }
  } catch (err) {
    console.error("Error fetching orders:", err);
    throw err;
  }
};

/**
 * 创建订单
 * @param productId 商品ID
 * @param chainId 链ID
 * @returns 操作结果
 */
export const createOrder = async (
  productId: string,
  chainId: string
): Promise<ApiResponse<ActionPostResponse>> => {
  try {
    const payload = {
      productId,
      chainId,
    };

    const response = await fetchWithAuth<ApiResponse<ActionPostResponse>>(
      "/api/v1/orders",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    return response;
  } catch (err) {
    console.error("Error creating order:", err);
    throw err;
  }
};

/**
 * 关闭订单
 * @param orderId 订单ID
 * @returns 操作结果
 */
export const closeOrder = async (orderId: string): Promise<boolean> => {
  try {
    const payload = { status: "closed" };

    const data = await fetchWithAuth<ApiResponse<{ success: boolean }>>(
      `/api/v1/orders/${orderId}/status`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );

    return data.success;
  } catch (err) {
    console.error("Error closing order:", err);
    throw err;
  }
};

/**
 * 导出订单
 * @param status 订单状态
 * @returns 导出结果
 */
export const exportOrders = async (status: string = "all"): Promise<Blob> => {
  try {
    let url = `/api/v1/orders/export`;

    if (status !== "all") {
      url += `?status=${status}`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error exporting orders: ${response.status}`);
    }

    return await response.blob();
  } catch (err) {
    console.error("Error exporting orders:", err);
    throw err;
  }
};

/**
 * 获取订单详情
 * @param orderId 订单ID
 * @returns Promise<Order>
 * @throws Error 当请求失败时抛出错误
 */
export async function getOrderById(orderId: string): Promise<Order> {
  const response = await fetchWithAuth<ApiResponse<Order>>(
    `/api/v1/orders/${orderId}`
  );

  if (!response.success) {
    throw new Error(response.message || `获取订单详情失败`);
  }

  // 处理 BigInt 序列化问题
  const order = response.data;
  return {
    ...order,
    amount: order.amount.toString(),
    post: order.post
      ? {
          ...order.post,
          price: order.post.price.toString(),
        }
      : undefined,
  };
}

/**
 * 获取用户订单列表
 * @param params 查询参数
 * @returns Promise<{ orders: Order[]; total: number }>
 * @throws Error 当请求失败时抛出错误
 */
export async function getUserOrders(params?: {
  page?: number;
  limit?: number;
  status?: Order["status"];
}): Promise<{ orders: Order[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.status) searchParams.set("status", params.status.toString());

  const response: Response = await fetchWithAuth(
    `/api/v1/orders?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(`获取订单列表失败: ${response.status}`);
  }

  const data = await response.json();

  // 处理 BigInt 序列化问题
  const processedOrders = data.orders.map((order: Order) => ({
    ...order,
    amount: order.amount.toString(),
    post: order.post
      ? {
          ...order.post,
          price: order.post.price.toString(),
        }
      : undefined,
  }));

  return {
    orders: processedOrders,
    total: data.total,
  };
}

/**
 * 取消订单
 * @param orderId 订单ID
 * @returns Promise<Order>
 * @throws Error 当请求失败时抛出错误
 */
export async function cancelOrder(orderId: string): Promise<Order> {
  const response: Response = await fetchWithAuth(
    `/api/v1/orders/${orderId}/cancel`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error(`取消订单失败: ${response.status}`);
  }

  const data = await response.json();
  return data as Order;
}

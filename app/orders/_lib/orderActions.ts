import { fetchWithAuth } from "@/_utils/api";

interface Order {
  id: string;
  customer: string;
  date: string;
  total: string;
  status: string;
  items: number;
  userAddress?: string;
  productId?: string;
  transactionHash?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

interface OrdersResponse {
  orders: Order[];
  pagination: PaginationInfo;
}

/**
 * 获取订单列表
 * @param status 订单状态
 * @param page 当前页码
 * @param pageSize 每页条数
 * @returns 订单列表和分页信息
 */
export const fetchOrders = async (
  status: string = "all",
  page: number = 1,
  pageSize: number = 10
): Promise<OrdersResponse> => {
  try {
    // Build the API URL with status filter and pagination
    let url = `/api/v1/orders?page=${page}&pageSize=${pageSize}`;

    // Add status filter if not "all"
    if (status !== "all") {
      url += `&status=${status}`;
    }

    const response = await fetchWithAuth(url);

    if (!response.ok) {
      throw new Error(`Error fetching orders: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      // Transform API data to match our component's expected format
      const formattedOrders = data.data.orders.map((order: any) => ({
        id: order.id,
        customer: order.userAddress,
        date: new Date(order.createdAt).toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        total: `¥${order.price}`,
        status: order.status,
        items: 1,
        userAddress: order.userAddress,
        productId: order.productId,
        transactionHash: order.transactionHash,
      }));

      return {
        orders: formattedOrders,
        pagination: {
          currentPage: data.data.currentPage,
          totalPages: data.data.totalPages,
          totalItems: data.data.totalItems,
          pageSize: data.data.pageSize,
        },
      };
    } else {
      throw new Error(data.message || "Failed to fetch orders");
    }
  } catch (err) {
    console.error("Error fetching orders:", err);
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

    const response = await fetchWithAuth(`/api/v1/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error updating order: ${response.status}`);
    }

    const data = await response.json();
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

    const response = await fetchWithAuth(url);

    if (!response.ok) {
      throw new Error(`Error exporting orders: ${response.status}`);
    }

    return await response.blob();
  } catch (err) {
    console.error("Error exporting orders:", err);
    throw err;
  }
};

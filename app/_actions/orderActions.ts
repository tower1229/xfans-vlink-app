import { fetchWithAuth } from "@/_utils/api";
import { ApiOrder, OrdersResponse, PaginationInfo } from "@/_types/order";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/**
 * 获取订单列表
 * @param status 订单状态
 * @param page 当前页码
 * @param pageSize 每页条数
 * @returns 订单列表和分页信息
 */
export const fetchOrders = async (
  status: ApiOrder["status"] | "all" = "all",
  page: number = 1,
  pageSize: number = 10
): Promise<{ orders: ApiOrder[]; pagination: PaginationInfo }> => {
  try {
    // Build the API URL with status filter and pagination
    let url = `/api/v1/orders?page=${page}&pageSize=${pageSize}`;

    // Add status filter if not "all"
    if (status !== "all") {
      url += `&status=${status}`;
    }

    const data = await fetchWithAuth<OrdersResponse>(url);

    if (data.success) {
      return {
        orders: data.data.orders,
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
    const payload = { status: 2 }; // 2 表示已关闭状态

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

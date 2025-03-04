"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../dashboard-layout";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "../utils/api";

// Define the Order type
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

export default function Orders() {
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [closing, setClosing] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });
  const router = useRouter();

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Build the API URL with status filter and pagination
        let url = `/api/v1/orders?page=${pagination.currentPage}&pageSize=${pagination.pageSize}`;

        // Add status filter if not "all"
        if (activeTab !== "all") {
          url += `&status=${activeTab}`;
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

          setOrders(formattedOrders);
          setPagination({
            currentPage: data.data.currentPage,
            totalPages: data.data.totalPages,
            totalItems: data.data.totalItems,
            pageSize: data.data.pageSize,
          });
        } else {
          throw new Error(data.message || "Failed to fetch orders");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab, pagination.currentPage, pagination.pageSize]);

  // No need for client-side filtering since we're filtering on the server
  const filteredOrders = orders;

  const getStatusClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Translate status to Chinese
  const translateStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "待支付";
      case "completed":
        return "已支付";
      case "closed":
        return "已关闭";
      default:
        return status;
    }
  };

  // Handle view order details
  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  // Handle close order
  const handleCloseOrder = async (orderId: string) => {
    if (!confirm("确定要关闭此订单吗？此操作不可撤销。")) {
      return;
    }

    try {
      setClosing(orderId);

      const payload = { status: "closed" };

      const response = await fetchWithAuth(`/api/v1/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error updating order: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Update the local order state
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: "closed" } : order
          )
        );
        alert("订单已成功关闭");
      } else {
        throw new Error(data.message || "Failed to close order");
      }
    } catch (err) {
      console.error("Error closing order:", err);
      alert(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setClosing(null);
    }
  };

  // Handle export orders
  const handleExportOrders = () => {
    // Implementation for exporting orders
    alert("导出功能即将实现");
  };

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("all")}
              className={`py-4 px-6 text-sm font-medium ${activeTab === "all"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              全部
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-4 px-6 text-sm font-medium ${activeTab === "pending"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              待支付
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`py-4 px-6 text-sm font-medium ${activeTab === "completed"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              已完成
            </button>
            <button
              onClick={() => setActiveTab("closed")}
              className={`py-4 px-6 text-sm font-medium ${activeTab === "closed"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              已关闭
            </button>
          </nav>
          <div className="p-4">
            {loading ? (
              <p>加载订单中...</p>
            ) : error ? (
              <p>错误: {error}</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <div className="min-w-full inline-block">
                    <div className="border-b bg-gray-50 border-gray-200 grid gap-0 grid-cols-10">
                      <div className="font-medium text-left text-xs tracking-wider py-3 px-4 text-gray-500 uppercase">
                        订单ID
                      </div>
                      <div className="font-medium text-left text-xs tracking-wider py-3 px-4 text-gray-500 uppercase">
                        客户
                      </div>
                      <div className="font-medium text-left text-xs tracking-wider py-3 px-4 text-gray-500 uppercase">
                        日期
                      </div>
                      <div className="font-medium text-left text-xs tracking-wider py-3 px-4 text-gray-500 uppercase">
                        总金额
                      </div>
                      <div className="font-medium text-left text-xs tracking-wider py-3 px-4 text-gray-500 uppercase">
                        状态
                      </div>
                      <div className="font-medium text-left text-xs tracking-wider py-3 px-4 text-gray-500 uppercase">
                        商品数量
                      </div>
                      <div className="font-medium text-left text-xs tracking-wider py-3 px-4 text-gray-500 uppercase">
                        用户地址
                      </div>
                      <div className="font-medium text-left text-xs tracking-wider py-3 px-4 text-gray-500 uppercase">
                        商品ID
                      </div>
                      <div className="font-medium text-left text-xs tracking-wider py-3 px-4 text-gray-500 uppercase">
                        交易哈希
                      </div>
                      <div className="font-medium text-left text-xs tracking-wider py-3 px-4 text-gray-500 uppercase">
                        操作
                      </div>
                    </div>
                    <div className="divide-y bg-white divide-gray-200">
                      {filteredOrders.map((order) => (
                        <div key={order.id} className="grid gap-0 grid-cols-10">
                          <div className="text-sm py-4 px-4 text-gray-900 break-all">
                            {order.id}
                          </div>
                          <div className="text-sm py-4 px-4 text-gray-900 break-all">
                            {order.customer}
                          </div>
                          <div className="text-sm py-4 px-4 text-gray-500">
                            {order.date}
                          </div>
                          <div className="text-sm py-4 px-4 text-gray-900">
                            {order.total}
                          </div>
                          <div className="text-sm py-4 px-4 text-gray-900">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getStatusClass(
                                order.status
                              )}`}
                            >
                              {translateStatus(order.status)}
                            </span>
                          </div>
                          <div className="text-sm py-4 px-4 text-gray-900">
                            {order.items}
                          </div>
                          <div className="text-sm py-4 px-4 text-gray-900 break-all">
                            {order.userAddress}
                          </div>
                          <div className="text-sm py-4 px-4 text-gray-900 break-all">
                            {order.productId}
                          </div>
                          <div className="text-sm py-4 px-4 text-gray-900 break-all">
                            {order.transactionHash}
                          </div>
                          <div className="text-sm py-4 px-4 text-gray-900">
                            <button
                              onClick={() => handleViewOrder(order.id)}
                              className="mr-2 text-indigo-600 hover:text-indigo-900"
                            >
                              查看
                            </button>
                            <button
                              onClick={() => handleCloseOrder(order.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              关闭
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pagination Controls */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: Math.max(1, prev.currentPage - 1),
                        }))
                      }
                      disabled={pagination.currentPage === 1}
                      className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      上一页
                    </button>
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: Math.min(
                            prev.totalPages,
                            prev.currentPage + 1
                          ),
                        }))
                      }
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      下一页
                    </button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        显示第{" "}
                        <span className="font-medium">
                          {(pagination.currentPage - 1) * pagination.pageSize +
                            1}
                        </span>{" "}
                        到{" "}
                        <span className="font-medium">
                          {Math.min(
                            pagination.currentPage * pagination.pageSize,
                            pagination.totalItems
                          )}
                        </span>{" "}
                        条，共{" "}
                        <span className="font-medium">
                          {pagination.totalItems}
                        </span>{" "}
                        条
                      </p>
                    </div>
                    <div>
                      <nav
                        className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              currentPage: Math.max(1, prev.currentPage - 1),
                            }))
                          }
                          disabled={pagination.currentPage === 1}
                          className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                          <span className="sr-only">上一页</span>
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        {/* Page numbers */}
                        {Array.from(
                          { length: pagination.totalPages },
                          (_, i) => i + 1
                        )
                          .filter(
                            (page) =>
                              page === 1 ||
                              page === pagination.totalPages ||
                              Math.abs(page - pagination.currentPage) <= 1
                          )
                          .map((page, index, array) => {
                            if (index > 0 && array[index - 1] !== page - 1) {
                              return (
                                <span
                                  key={`ellipsis-${page}`}
                                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                                >
                                  ...
                                </span>
                              );
                            }
                            return (
                              <button
                                key={page}
                                onClick={() =>
                                  setPagination((prev) => ({
                                    ...prev,
                                    currentPage: page,
                                  }))
                                }
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${page === pagination.currentPage
                                  ? "z-10 bg-indigo-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                  : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                  }`}
                              >
                                {page}
                              </button>
                            );
                          })}
                        <button
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              currentPage: Math.min(
                                prev.totalPages,
                                prev.currentPage + 1
                              ),
                            }))
                          }
                          disabled={
                            pagination.currentPage === pagination.totalPages
                          }
                          className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                          <span className="sr-only">下一页</span>
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

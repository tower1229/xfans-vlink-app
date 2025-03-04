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

export default function Orders() {
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [closing, setClosing] = useState<string | null>(null);
  const router = useRouter();

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Build the API URL with status filter if not "all"
        const url =
          activeTab === "all"
            ? "/api/v1/orders"
            : `/api/v1/orders?status=${activeTab}`;

        const response = await fetchWithAuth(url);

        if (!response.ok) {
          throw new Error(`Error fetching orders: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          // Transform API data to match our component's expected format
          const formattedOrders = data.data.map((order: any) => ({
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
            items: 1, // Assuming each order has one item
            userAddress: order.userAddress,
            productId: order.productId,
            transactionHash: order.transactionHash,
          }));

          setOrders(formattedOrders);
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
  }, [activeTab]); // Re-fetch when activeTab changes

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
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "all"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "pending"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              待支付
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "completed"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              已完成
            </button>
            <button
              onClick={() => setActiveTab("closed")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "closed"
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
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  <div className="grid grid-cols-10 gap-0 bg-gray-50 border-b border-gray-200">
                    <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      订单ID
                    </div>
                    <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      客户
                    </div>
                    <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      日期
                    </div>
                    <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      总金额
                    </div>
                    <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </div>
                    <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      商品数量
                    </div>
                    <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用户地址
                    </div>
                    <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      商品ID
                    </div>
                    <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      交易哈希
                    </div>
                    <div className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </div>
                  </div>
                  <div className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="grid grid-cols-10 gap-0">
                        <div className="px-4 py-4 text-sm text-gray-900 break-all">
                          {order.id}
                        </div>
                        <div className="px-4 py-4 text-sm text-gray-900 break-all">
                          {order.customer}
                        </div>
                        <div className="px-4 py-4 text-sm text-gray-500">
                          {order.date}
                        </div>
                        <div className="px-4 py-4 text-sm text-gray-900">
                          {order.total}
                        </div>
                        <div className="px-4 py-4 text-sm text-gray-900">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {translateStatus(order.status)}
                          </span>
                        </div>
                        <div className="px-4 py-4 text-sm text-gray-900">
                          {order.items}
                        </div>
                        <div className="px-4 py-4 text-sm text-gray-900 break-all">
                          {order.userAddress}
                        </div>
                        <div className="px-4 py-4 text-sm text-gray-900 break-all">
                          {order.productId}
                        </div>
                        <div className="px-4 py-4 text-sm text-gray-900 break-all">
                          {order.transactionHash}
                        </div>
                        <div className="px-4 py-4 text-sm text-gray-900">
                          <button
                            onClick={() => handleViewOrder(order.id)}
                            className="text-indigo-600 hover:text-indigo-900 mr-2"
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
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

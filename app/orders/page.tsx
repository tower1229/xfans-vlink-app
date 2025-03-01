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
        const url = activeTab === "all"
          ? '/api/v1/orders'
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
            customer: order.userAddress.substring(0, 6) + '...' + order.userAddress.substring(38),
            date: new Date(order.createdAt).toLocaleDateString(),
            total: `¥${order.price}`,
            status: order.status,
            items: 1, // Assuming each order has one item
            userAddress: order.userAddress,
            productId: order.productId,
            transactionHash: order.transactionHash
          }));

          setOrders(formattedOrders);
        } else {
          throw new Error(data.message || 'Failed to fetch orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
    if (!confirm('确定要关闭此订单吗？此操作不可撤销。')) {
      return;
    }

    try {
      setClosing(orderId);

      const payload = { status: "closed" };

      const response = await fetchWithAuth(`/api/v1/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error updating order: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Update the local order state
        setOrders(prev =>
          prev.map(order =>
            order.id === orderId
              ? { ...order, status: "closed" }
              : order
          )
        );
        alert('订单已成功关闭');
      } else {
        throw new Error(data.message || 'Failed to close order');
      }
    } catch (err) {
      console.error('Error closing order:', err);
      alert(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setClosing(null);
    }
  };

  // Handle export orders
  const handleExportOrders = () => {
    // Implementation for exporting orders
    alert('导出功能即将实现');
  };

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("all")}
              className={`py-4 px-6 text-sm font-medium ${activeTab === "all"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              全部订单
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
              已支付
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
        </div>

        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-800">
                {activeTab === "all"
                  ? "全部订单"
                  : `${translateStatus(activeTab)}`}
              </h3>
              <p className="text-sm text-gray-500">
                {filteredOrders.length} 个订单
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleExportOrders}
                className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
              >
                导出
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-600 underline"
              >
                重试
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      订单 ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      客户
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      日期
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      金额
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      数量
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {order.id.substring(0, 10)}...
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.customer}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.date}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {order.total}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.items}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {translateStatus(order.status)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewOrder(order.id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              查看
                            </button>
                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleCloseOrder(order.id)}
                                disabled={closing === order.id}
                                className="text-red-600 hover:text-red-800 disabled:opacity-50"
                              >
                                {closing === order.id ? '处理中...' : '关闭'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        没有找到订单
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

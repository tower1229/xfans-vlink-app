"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/(core)/dashboard-layout";
import { fetchWithAuth } from "@/_utils/api";

interface OrderDetail {
  id: string;
  productId: string;
  userAddress: string;
  price: string;
  tokenAddress: string;
  ownerAddress: string;
  chainId: number;
  status: string;
  transactionHash: string | null;
  createdAt: string;
  expiresAt: string;
  isExpired: boolean;
}

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const response = await fetchWithAuth(`/api/v1/orders/${orderId}`);

        if (!response.ok) {
          throw new Error(`Error fetching order: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setOrder(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch order details");
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  // Handle closing order
  const handleCloseOrder = async () => {
    if (!confirm("确定要关闭此订单吗？此操作不可撤销。")) {
      return;
    }

    try {
      setUpdating(true);

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
        setOrder((prev) => (prev ? { ...prev, status: "closed" } : null));
        alert("订单已成功关闭");
      } else {
        throw new Error(data.message || "Failed to close order");
      }
    } catch (err) {
      console.error("Error closing order:", err);
      alert(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setUpdating(false);
    }
  };

  // Get status badge class
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

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Format address
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
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

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200 py-4 px-6">
          <div className="flex justify-between items-center">
            <h1 className="font-semibold text-xl text-gray-900">订单详情</h1>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              返回订单列表
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex py-20 justify-center items-center">
            <div className="rounded-full border-b-2 border-blue-500 h-12 animate-spin w-12"></div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="border rounded-md bg-red-50 border-red-200 py-3 px-4 text-red-700">
              <p>{error}</p>
              <button
                onClick={() => router.push("/orders")}
                className="mt-2 text-sm text-red-600 underline"
              >
                返回订单列表
              </button>
            </div>
          </div>
        ) : order ? (
          <div className="p-6">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-4">
                <h2 className="font-medium text-lg mb-4 text-gray-900">
                  订单信息
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">订单 ID</p>
                    <p className="font-medium text-sm text-gray-900">
                      {order.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">状态</p>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {translateStatus(order.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">创建时间</p>
                    <p className="font-medium text-sm text-gray-900">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">过期时间</p>
                    <p className="font-medium text-sm text-gray-900">
                      {formatDate(order.expiresAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">价格</p>
                    <p className="font-medium text-sm text-gray-900">
                      ¥{order.price}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <h2 className="font-medium text-lg mb-4 text-gray-900">
                  区块链信息
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">用户地址</p>
                    <p className="font-medium text-sm text-gray-900 break-all">
                      {order.userAddress}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">所有者地址</p>
                    <p className="font-medium text-sm text-gray-900 break-all">
                      {order.ownerAddress}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">代币地址</p>
                    <p className="font-medium text-sm text-gray-900 break-all">
                      {order.tokenAddress}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">链 ID</p>
                    <p className="font-medium text-sm text-gray-900">
                      {order.chainId}
                    </p>
                  </div>
                  {order.transactionHash && (
                    <div>
                      <p className="text-sm text-gray-500">交易哈希</p>
                      <p className="font-medium text-sm text-gray-900 break-all">
                        {order.transactionHash}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 mt-6 pt-6">
              <h2 className="font-medium text-lg mb-4 text-gray-900">操作</h2>
              <div className="flex flex-wrap gap-3">
                {order.status === "pending" && (
                  <button
                    onClick={handleCloseOrder}
                    disabled={updating}
                    className="rounded-md bg-red-600 text-white py-2 px-4 hover:bg-red-700 disabled:opacity-50"
                  >
                    {updating ? "处理中..." : "关闭订单"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 text-gray-500">未找到订单</div>
        )}
      </div>
    </DashboardLayout>
  );
}

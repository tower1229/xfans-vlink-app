"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/(core)/dashboard-layout";
import OrderList from "./_components/OrderList";
import OrderTabs from "./_components/OrderTabs";
import OrderPagination from "./_components/OrderPagination";
import { fetchOrders, closeOrder } from "./_lib/orderActions";
import { ApiOrder, PaginationInfo } from "@/_types/order";
import { OrderStatus } from "./_lib/orderUtils";

export default function Orders() {
  const [activeTab, setActiveTab] = useState<0 | 1 | 2 | 3 | 4 | "all">("all");
  const [orders, setOrders] = useState<ApiOrder[]>([]);
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
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchOrders(
          activeTab,
          pagination.currentPage,
          pagination.pageSize
        );

        setOrders(result.orders);
        setPagination(result.pagination);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [activeTab, pagination.currentPage, pagination.pageSize]);

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

      const success = await closeOrder(orderId);

      if (success) {
        // Update the local order state
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? { ...order, status: OrderStatus.CLOSED as 0 | 1 | 2 | 3 | 4 }
              : order
          )
        );
      } else {
        throw new Error("Failed to close order");
      }
    } catch (err) {
      console.error("Error closing order:", err);
      alert(
        err instanceof Error ? `关闭订单失败: ${err.message}` : "关闭订单失败"
      );
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
        <OrderTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="p-4">
          <div className="flex mb-4 justify-between items-center">
            <h1 className="font-semibold text-xl text-gray-900">订单管理</h1>
            <button
              onClick={handleExportOrders}
              className="rounded-md bg-blue-600 text-white py-2 px-4 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              导出订单
            </button>
          </div>

          <OrderList
            orders={orders}
            loading={loading}
            error={error}
            closing={closing}
            handleViewOrder={handleViewOrder}
            handleCloseOrder={handleCloseOrder}
          />

          <OrderPagination
            pagination={pagination}
            setPagination={setPagination}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

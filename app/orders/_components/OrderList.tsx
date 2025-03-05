import React from "react";
import OrderStatusBadge from "./OrderStatusBadge";
import { ApiOrder } from "@/_types/order";

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 格式化金额
const formatPrice = (price: number | string) => {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return `¥${numPrice.toFixed(2)}`;
};

interface OrderListProps {
  orders: ApiOrder[];
  loading: boolean;
  error: string | null;
  closing: string | null;
  handleViewOrder: (orderId: string) => void;
  handleCloseOrder: (orderId: string) => void;
}

const OrderList: React.FC<OrderListProps> = ({
  orders,
  loading,
  error,
  closing,
  handleViewOrder,
  handleCloseOrder,
}) => {
  if (loading) {
    return (
      <div className="flex py-12 justify-center items-center">
        <div className="rounded-full border-b-2 border-blue-500 h-8 animate-spin w-8"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded bg-red-50 border-red-200 my-4 py-3 px-4 text-red-800 relative">
        <strong className="font-bold">错误：</strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">暂无订单数据</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="divide-y min-w-full divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="font-medium text-left text-xs tracking-wider py-3 px-6 text-gray-500 uppercase"
            >
              订单号
            </th>
            <th
              scope="col"
              className="font-medium text-left text-xs tracking-wider py-3 px-6 text-gray-500 uppercase"
            >
              客户
            </th>
            <th
              scope="col"
              className="font-medium text-left text-xs tracking-wider py-3 px-6 text-gray-500 uppercase"
            >
              日期
            </th>
            <th
              scope="col"
              className="font-medium text-left text-xs tracking-wider py-3 px-6 text-gray-500 uppercase"
            >
              金额
            </th>
            <th
              scope="col"
              className="font-medium text-left text-xs tracking-wider py-3 px-6 text-gray-500 uppercase"
            >
              状态
            </th>
            <th
              scope="col"
              className="font-medium text-right text-xs tracking-wider py-3 px-6 text-gray-500 uppercase"
            >
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y bg-white divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="font-medium text-sm py-4 px-6 text-gray-900 whitespace-nowrap">
                {order.id.substring(0, 8)}...
              </td>
              <td className="text-sm py-4 px-6 text-gray-500 whitespace-nowrap">
                {order.user?.username || "N/A"}
              </td>
              <td className="text-sm py-4 px-6 text-gray-500 whitespace-nowrap">
                {formatDate(order.createdAt)}
              </td>
              <td className="text-sm py-4 px-6 text-gray-500 whitespace-nowrap">
                {formatPrice(order.price)}
              </td>
              <td className="py-4 px-6 whitespace-nowrap">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="font-medium text-right text-sm py-4 px-6 whitespace-nowrap">
                <button
                  onClick={() => handleViewOrder(order.id)}
                  className="mr-4 text-blue-600 hover:text-blue-900"
                >
                  查看
                </button>
                {order.status === 0 && (
                  <button
                    onClick={() => handleCloseOrder(order.id)}
                    disabled={closing === order.id}
                    className={`text-red-600 hover:text-red-900 ${
                      closing === order.id
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {closing === order.id ? "处理中..." : "关闭"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderList;

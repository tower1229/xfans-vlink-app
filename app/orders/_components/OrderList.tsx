import React from "react";
import OrderStatusBadge from "./OrderStatusBadge";

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

interface OrderListProps {
  orders: Order[];
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
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative my-4">
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
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              订单号
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              客户
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              日期
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              金额
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              状态
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {order.id.substring(0, 8)}...
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.customer
                  ? `${order.customer.substring(
                      0,
                      6
                    )}...${order.customer.substring(order.customer.length - 4)}`
                  : "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.total}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleViewOrder(order.id)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  查看
                </button>
                {order.status === "pending" && (
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

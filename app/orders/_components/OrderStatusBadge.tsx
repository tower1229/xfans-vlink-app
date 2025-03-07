import React from "react";
import { OrderStatus, OrderStatusMap } from "@/_utils/orderUtils";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

// 状态样式映射
const STATUS_STYLE_MAP: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "bg-blue-100 text-blue-800",
  [OrderStatus.COMPLETED]: "bg-green-100 text-green-800",
  [OrderStatus.EXPIRED]: "bg-yellow-100 text-yellow-800",
  [OrderStatus.FAILED]: "bg-red-100 text-red-800",
  [OrderStatus.CLOSED]: "bg-gray-100 text-gray-800",
};

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_STYLE_MAP[status]}`}
    >
      {OrderStatusMap[status]}
    </span>
  );
};

export default OrderStatusBadge;

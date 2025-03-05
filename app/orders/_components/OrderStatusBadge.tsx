import React from "react";

interface OrderStatusBadgeProps {
  status: string;
}

export const getStatusClass = (status: string) => {
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
export const translateStatus = (status: string) => {
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

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(
        status
      )}`}
    >
      {translateStatus(status)}
    </span>
  );
};

export default OrderStatusBadge;

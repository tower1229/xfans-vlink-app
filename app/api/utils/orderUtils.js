import { v4 as uuidv4 } from "uuid";

// 定义订单状态常量
export const OrderStatus = {
  PENDING: 0, // 待支付
  COMPLETED: 1, // 已完成
  EXPIRED: 2, // 已过期
  FAILED: 3, // 已失败
  CLOSED: 4, // 已关闭
};

// 订单状态映射（用于显示）
export const OrderStatusMap = {
  [OrderStatus.PENDING]: "待支付",
  [OrderStatus.COMPLETED]: "已完成",
  [OrderStatus.EXPIRED]: "已过期",
  [OrderStatus.FAILED]: "已失败",
  [OrderStatus.CLOSED]: "已关闭",
};

/**
 * 生成订单ID
 * @returns {string} 订单ID
 */
export function generateOrderId() {
  return uuidv4();
}

/**
 * 格式化订单状态文本
 * @param {number} status 订单状态码
 * @returns {string} 状态文本
 */
export function formatOrderStatus(status) {
  return OrderStatusMap[status] || "未知状态";
}

/**
 * 检查订单是否已过期
 * @param {Date|string} expiresAt 过期时间
 * @param {number} status 订单状态
 * @returns {boolean} 是否已过期
 */
export function isOrderExpired(expiresAt, status) {
  if (status === OrderStatus.EXPIRED) return true;
  if (status !== OrderStatus.PENDING) return false;

  const expireDate =
    expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  return expireDate < new Date();
}

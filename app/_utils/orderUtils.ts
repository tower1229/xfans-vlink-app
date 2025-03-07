import {
  keccak256,
  encodePacked,
  encodeAbiParameters,
  parseAbiParameters,
  Address,
} from "viem";
import { OrderError } from "./errors";

// 定义订单状态常量
export const OrderStatus = {
  PENDING: 0, // 待支付
  COMPLETED: 1, // 已完成
  EXPIRED: 2, // 已过期
  FAILED: 3, // 已失败
  CLOSED: 4, // 已关闭
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

// 订单状态映射（用于显示）
export const OrderStatusMap: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "待支付",
  [OrderStatus.COMPLETED]: "已完成",
  [OrderStatus.EXPIRED]: "已过期",
  [OrderStatus.FAILED]: "已失败",
  [OrderStatus.CLOSED]: "已关闭",
};

interface OrderIdResult {
  orderId: string;
  timestamp: number;
}

interface OrderData {
  orderId: string;
  productId: string;
  userAddress: Address;
  price: number;
}

/**
 * 生成唯一的订单ID
 * @param productId - 产品ID
 * @param userAddress - 用户钱包地址
 * @returns 包含orderId和timestamp的对象
 */
export function generateOrderId(
  productId: string,
  userAddress: Address
): OrderIdResult {
  try {
    if (!productId || !userAddress) {
      throw new OrderError("产品ID和用户地址不能为空", "INVALID_PARAMS");
    }

    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000000);

    const orderIdInput = encodePacked(
      ["string", "uint256", "address", "uint256"],
      [productId, BigInt(timestamp), userAddress, BigInt(randomNum)]
    );

    const orderId = keccak256(orderIdInput);

    return {
      orderId,
      timestamp,
    };
  } catch (error) {
    if (error instanceof OrderError) throw error;
    throw new OrderError(
      `生成订单ID失败: ${
        error instanceof Error ? error.message : String(error)
      }`,
      "GENERATE_ID_ERROR"
    );
  }
}

/**
 * 生成订单签名
 * @param orderData 订单数据
 * @returns 签名
 */
export async function generateOrderSignature(
  orderData: OrderData
): Promise<string> {
  try {
    if (!orderData || typeof orderData !== "object") {
      throw new OrderError("订单数据必须是一个对象", "INVALID_ORDER_DATA");
    }

    const requiredFields = ["orderId", "productId", "userAddress", "price"];
    for (const field of requiredFields) {
      if (!orderData[field as keyof OrderData]) {
        throw new OrderError(
          `缺少必要字段: ${field}`,
          "MISSING_REQUIRED_FIELD"
        );
      }
    }

    // 构建签名消息
    const messageHash = keccak256(
      encodeAbiParameters(
        parseAbiParameters("bytes32, string, address, uint256"),
        [
          orderData.orderId as `0x${string}`,
          orderData.productId,
          orderData.userAddress,
          BigInt(orderData.price),
        ]
      )
    );

    return messageHash;
  } catch (error) {
    console.error("生成订单签名失败:", error);
    if (error instanceof OrderError) throw error;
    throw new OrderError(
      `生成订单签名失败: ${
        error instanceof Error ? error.message : String(error)
      }`,
      "GENERATE_SIGNATURE_ERROR"
    );
  }
}

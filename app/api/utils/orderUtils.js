import { ZERO_ADDRESS } from "@/_lib/constant";
import { v4 as uuidv4 } from "uuid";
import { encodeFunctionData } from "viem";
import { privateKeyToAccount } from "viem/accounts";

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
 * @returns {string} 订单ID（64个字符，适合bytes32格式）
 */
export function generateOrderId() {
  // 使用两个UUID拼接，确保生成64个字符
  const uuid1 = uuidv4().replace(/-/g, "");
  const uuid2 = uuidv4().replace(/-/g, "");
  return uuid1 + uuid2;
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

/**
 * 签名订单消息
 * @param {string} messageHash - 消息哈希
 * @returns {Promise<string>} 签名
 */
export async function signOrderMessage(messageHash) {
  try {
    const privateKey = process.env.VERIFIER_PRIVATE_KEY;

    // 检查私钥是否存在且不为空
    if (!privateKey || privateKey.trim() === "") {
      throw new Error(
        "未配置签名私钥，无法创建订单。请在环境变量中设置VERIFIER_PRIVATE_KEY"
      );
    }

    // 格式化私钥，确保有0x前缀
    const formattedPrivateKey = privateKey.startsWith("0x")
      ? privateKey
      : `0x${privateKey}`;

    // 创建账户
    const account = privateKeyToAccount(formattedPrivateKey);

    // 使用账户签名消息
    const signature = await account.signMessage({
      message: { raw: messageHash },
    });

    return signature;
  } catch (error) {
    console.error("生成订单签名失败:", error);
    throw new Error(`签名生成失败: ${error.message}`);
  }
}

/**
 * 构建支付交易
 * @param {Object} order - 订单信息
 * @param {string} encodedOrderData - 编码后的订单数据
 * @param {string} signature - 签名
 * @returns {Object} 交易对象
 */
export async function buildPaymentTransaction(
  order,
  encodedOrderData,
  signature
) {
  // 定义支付合约地址
  const NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS ||
    "0x1234567890123456789012345678901234567890";
  // 根据支付方式构建不同的交易
  if (order.post.tokenAddress === ZERO_ADDRESS) {
    // ETH支付 - 构建payWithNative交易
    return {
      to: NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS,
      value: order.amount.toString(),
      data: encodeFunctionData({
        abi: [
          {
            name: "payWithNative",
            type: "function",
            stateMutability: "payable",
            inputs: [
              { name: "orderData", type: "bytes" },
              { name: "signature", type: "bytes" },
            ],
            outputs: [],
          },
        ],
        functionName: "payWithNative",
        args: [encodedOrderData, signature],
      }),
      chainId: order.chainId,
    };
  } else {
    // ERC20支付 - 构建payWithERC20交易
    return {
      to: NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS,
      value: "0",
      data: encodeFunctionData({
        abi: [
          {
            name: "payWithERC20",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              { name: "token", type: "address" },
              { name: "amount", type: "uint256" },
              { name: "orderData", type: "bytes" },
              { name: "signature", type: "bytes" },
            ],
            outputs: [],
          },
        ],
        functionName: "payWithERC20",
        args: [
          order.post.tokenAddress,
          BigInt(order.amount.toString()),
          encodedOrderData,
          signature,
        ],
      }),
      chainId: order.chainId,
    };
  }
}

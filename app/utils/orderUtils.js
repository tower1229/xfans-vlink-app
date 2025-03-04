import {
  keccak256,
  encodePacked,
  toHex,
  encodeAbiParameters,
  parseAbiParameters,
} from "viem";
import { signMessage } from "viem/accounts";
import { db } from "@/lib/db";
import { getPostById } from "./postUtils";

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

// 定义错误类型
export class OrderError extends Error {
  constructor(message, code = "ORDER_ERROR") {
    super(message);
    this.name = "OrderError";
    this.code = code;
  }
}

/**
 * 生成唯一的订单ID
 * @param {string} productId - 产品ID
 * @param {string} userAddress - 用户钱包地址
 * @returns {Object} - 包含orderId和timestamp的对象
 */
export function generateOrderId(productId, userAddress) {
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
      `生成订单ID失败: ${error.message}`,
      "GENERATE_ID_ERROR"
    );
  }
}

/**
 * 验证订单数据
 * @param {Object} orderData - 订单数据
 * @throws {OrderError} 如果验证失败
 */
function validateOrderData(orderData) {
  if (!orderData || typeof orderData !== "object") {
    throw new OrderError("订单数据必须是一个对象", "INVALID_ORDER_DATA");
  }

  const requiredFields = ["productId", "userId", "userAddress", "chainId"];
  for (const field of requiredFields) {
    if (!orderData[field]) {
      throw new OrderError(`缺少必要字段: ${field}`, "MISSING_REQUIRED_FIELD");
    }
  }
}

/**
 * 格式化数据库订单对象
 * @param {Object} dbOrder - 数据库订单对象
 * @returns {Object} 格式化后的订单对象
 */
function formatOrderFromDb(dbOrder) {
  if (!dbOrder) return null;

  const formattedOrder = {
    id: dbOrder.id,
    productId: dbOrder.post?.id || dbOrder.postId,
    userAddress: dbOrder.user?.walletAddress || dbOrder.userId,
    price: dbOrder.amount.toString(),
    status: dbOrder.status,
    transactionHash: dbOrder.txHash,
    createdAt: dbOrder.createdAt,
    updatedAt: dbOrder.updatedAt,
    expiresAt: dbOrder.expiresAt,
  };

  if (dbOrder.post) {
    formattedOrder.tokenAddress = dbOrder.post.tokenAddress;
    formattedOrder.ownerAddress = dbOrder.post.ownerAddress;
    formattedOrder.chainId = dbOrder.post.chainId;
  }

  return formattedOrder;
}

/**
 * 更新过期订单状态
 * @returns {Promise<number>} 更新的订单数量
 */
export async function updateExpiredOrders() {
  try {
    const now = new Date();

    const result = await db.order.updateMany({
      where: {
        status: OrderStatus.PENDING,
        expiresAt: {
          lt: now,
        },
      },
      data: {
        status: OrderStatus.EXPIRED,
        updatedAt: now,
      },
    });

    return result?.count || 0;
  } catch (error) {
    console.error("更新过期订单失败:", error);
    return 0;
  }
}

/**
 * 获取用户订单列表
 * @param {string} userAddress 用户地址
 * @param {string} status 订单状态
 * @param {Object} options 分页选项
 * @returns {Promise<{orders: Array, total: number}>} 订单列表和总数
 */
export async function getOrdersByUser(userAddress, status, options = {}) {
  try {
    const { skip = 0, limit = 10 } = options;

    // 构建查询条件
    const query = { userAddress };
    if (status && status !== "all") {
      query.status = status;
    }

    // 使用 Promise.all 并行查询数据和总数
    const [orders, total] = await Promise.all([
      db.order.findMany({
        where: query,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          post: true,
          user: true,
          product: {
            select: {
              title: true,
              price: true,
              image: true,
            },
          },
        },
      }),
      db.order.count({ where: query }),
    ]);

    // 格式化订单数据
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      productId: order.post?.id || order.postId,
      price: order.amount.toString(),
      tokenAddress: order.post?.tokenAddress || order.tokenAddress,
      chainId: order.post?.chainId || order.chainId,
      status: order.status,
      statusText: OrderStatusMap[order.status],
      transactionHash: order.txHash,
      createdAt: order.createdAt,
      expiresAt: order.expiresAt,
      isExpired:
        order.expiresAt < new Date() && order.status === OrderStatus.PENDING,
      product: order.post, // 包含商品信息
    }));

    return { orders: formattedOrders, total };
  } catch (error) {
    console.error("获取用户订单列表失败:", error);
    throw new OrderError("获取订单列表失败", "DB_ERROR");
  }
}

/**
 * 创建新订单
 * @param {Object} orderData - 订单数据
 * @returns {Promise<Object>} 创建的订单
 */
export async function createNewOrder(orderData) {
  try {
    validateOrderData(orderData);

    const post = await getPostById(orderData.productId);
    if (!post) {
      throw new OrderError(
        `产品 ${orderData.productId} 不存在`,
        "PRODUCT_NOT_FOUND"
      );
    }

    const { orderId } = generateOrderId(
      orderData.productId,
      orderData.userAddress
    );

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const newOrderData = {
      id: orderId,
      productId: orderData.productId,
      userId: orderData.userId,
      price: post.price,
      tokenAddress: post.tokenAddress || process.env.DEFAULT_TOKEN_ADDRESS,
      ownerAddress: post.ownerAddress,
      chainId: orderData.chainId,
      status: OrderStatus.PENDING,
      expiresAt,
    };

    const signature = await generateOrderSignature(newOrderData);
    newOrderData.signature = signature;

    const order = await createOrder(newOrderData);
    return order;
  } catch (error) {
    if (error instanceof OrderError) throw error;
    throw new OrderError(
      `创建订单失败: ${error.message}`,
      "CREATE_ORDER_ERROR"
    );
  }
}

/**
 * 为订单生成签名
 * @param {Object} orderData 订单数据
 * @returns {Promise<string>} 签名
 */
export async function generateOrderSignature(orderData) {
  try {
    // 从环境变量获取私钥
    const privateKey = process.env.VERIFIER_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("未配置签名私钥");
    }

    // 确保私钥格式正确（添加0x前缀如果没有）
    const formattedPrivateKey = privateKey.startsWith("0x")
      ? privateKey
      : `0x${privateKey}`;

    // 获取当前时间戳（秒）
    const timestamp = Math.floor(Date.now() / 1000);

    // 构建要签名的消息 - 使用与合约一致的格式
    const message = encodeAbiParameters(
      parseAbiParameters("bytes32, uint256, address, address, uint32, uint64"),
      [
        orderData.id, // orderId (bytes32)
        BigInt(orderData.price.toString()), // amount (uint256)
        orderData.tokenAddress, // token (address)
        orderData.ownerAddress, // sellerAddress (address)
        timestamp, // timestamp (uint32)
        BigInt(orderData.chainId), // chainId (uint64)
      ]
    );

    // 计算消息哈希
    const messageHash = keccak256(message);

    // 签名消息
    const signature = await signMessage({
      message: { raw: toHex(messageHash) },
      privateKey: formattedPrivateKey,
    });

    return signature;
  } catch (error) {
    console.error("生成订单签名失败:", error);
    throw new Error(`生成订单签名失败: ${error.message}`);
  }
}

/**
 * 创建订单
 * @param {Object} orderData 订单数据
 * @returns {Promise<Object>} 创建的订单
 */
export async function createOrder(orderData) {
  try {
    // 使用Prisma创建订单
    const order = await db.order.create({
      data: {
        id: orderData.id,
        // 使用关联而不是直接设置外键
        post: {
          connect: {
            id: orderData.productId,
          },
        },
        user: {
          connect: {
            id: orderData.userId,
          },
        },
        amount: BigInt(orderData.price.toString()),
        txHash: null,
        status: orderData.status || "pending",
      },
      include: {
        post: true,
        user: true,
      },
    });

    // 将自定义字段添加到返回对象中，而不是尝试存储到数据库
    const formattedOrder = formatOrderFromDb(order);

    // 添加自定义字段到返回对象
    formattedOrder.tokenAddress = orderData.tokenAddress;
    formattedOrder.ownerAddress = orderData.ownerAddress;
    formattedOrder.chainId = orderData.chainId;
    formattedOrder.signature = orderData.signature || null;
    formattedOrder.expiresAt = orderData.expiresAt;

    return formattedOrder;
  } catch (error) {
    console.error("创建订单失败:", error);
    throw new Error(`创建订单失败: ${error.message}`);
  }
}

/**
 * 根据ID获取订单
 * @param {string} orderId 订单ID
 * @returns {Promise<Object|null>} 订单对象或null
 */
export async function getOrderById(orderId) {
  try {
    // 使用Prisma查询订单
    const order = await db.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        post: true,
        user: true,
      },
    });

    if (!order) {
      return null;
    }

    return formatOrderFromDb(order);
  } catch (error) {
    console.error(`获取订单 ${orderId} 失败:`, error);
    throw new Error(`获取订单失败: ${error.message}`);
  }
}

/**
 * 更新订单状态
 * @param {string} orderId 订单ID
 * @param {string} status 新状态
 * @param {string} txHash 交易哈希（可选）
 * @returns {Promise<Object>} 更新后的订单
 */
export async function updateOrderStatus(orderId, status, txHash = null) {
  try {
    const updateData = {
      status,
      updatedAt: new Date(),
    };

    if (txHash) {
      updateData.txHash = txHash;
    }

    // 检查数据库模型中是否存在completedAt字段
    // 根据错误信息，completedAt字段不在数据库模型中，所以不应该设置它
    // 如果状态是已完成，可以在这里添加其他需要更新的字段
    // if (status === "completed") {
    //   updateData.completedAt = new Date();
    // }

    // 使用Prisma更新订单
    const order = await db.order.update({
      where: {
        id: orderId,
      },
      data: updateData,
      include: {
        post: true,
        user: true,
      },
    });

    return formatOrderFromDb(order);
  } catch (error) {
    console.error(`更新订单 ${orderId} 状态失败:`, error);
    throw new Error(`更新订单状态失败: ${error.message}`);
  }
}

/**
 * 获取所有订单
 * @returns {Promise<Array>} 订单列表
 */
export async function getAllOrders() {
  try {
    // 使用Prisma查询所有订单
    const orders = await db.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        post: true,
        user: true,
      },
    });

    return orders.map(formatOrderFromDb);
  } catch (error) {
    console.error("获取所有订单失败:", error);
    throw new Error(`获取所有订单失败: ${error.message}`);
  }
}

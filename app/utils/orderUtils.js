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

/**
 * 生成唯一的订单ID
 * @param {string} productId - 产品ID
 * @param {string} userAddress - 用户钱包地址
 * @returns {string} - 生成的订单ID (bytes32 哈希值)
 */
export function generateOrderId(productId, userAddress) {
  // 创建时间戳和随机数，确保订单ID的唯一性
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000000);

  // 将产品ID、时间戳、用户地址和随机数打包编码
  const orderIdInput = encodePacked(
    ["string", "uint256", "address", "uint256"],
    [productId, BigInt(timestamp), userAddress, BigInt(randomNum)]
  );

  // 计算哈希值作为订单ID
  const orderId = keccak256(orderIdInput);

  return {
    orderId,
    timestamp,
  };
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

    // 如果状态是已完成，设置完成时间
    if (status === "completed") {
      updateData.completedAt = new Date();
    }

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
 * 更新过期订单
 * @returns {Promise<number>} 更新的订单数量
 */
export async function updateExpiredOrders() {
  try {
    const now = new Date();

    // 使用Prisma更新过期订单
    const result = await db.order.updateMany({
      where: {
        status: "pending",
        expiresAt: {
          lt: now,
        },
      },
      data: {
        status: "expired",
        updatedAt: now,
      },
    });

    console.log(`已将 ${result.count} 个过期订单标记为过期`);
    return result.count;
  } catch (error) {
    console.error("更新过期订单失败:", error);
    throw new Error(`更新过期订单失败: ${error.message}`);
  }
}

/**
 * 获取用户订单
 * @param {string} userAddress 用户地址
 * @param {string} status 可选的订单状态过滤
 * @returns {Promise<Array>} 订单列表
 */
export async function getOrdersByUser(userAddress, status = null) {
  try {
    // 构建查询条件
    const whereCondition = {
      userId: userAddress, // 使用userId而不是userAddress，与数据库模型匹配
    };

    // 如果提供了状态，添加到查询条件
    if (status) {
      whereCondition.status = status;
    }

    // 使用Prisma查询用户订单
    const orders = await db.order.findMany({
      where: whereCondition,
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
    console.error(`获取用户 ${userAddress} 的订单失败:`, error);
    throw new Error(`获取用户订单失败: ${error.message}`);
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

/**
 * 创建新订单
 * @param {Object} orderData 订单数据
 * @returns {Promise<Object>} 创建的订单
 */
export async function createNewOrder(orderData) {
  try {
    // Validate orderData
    if (!orderData || typeof orderData !== "object") {
      throw new Error("Invalid order data: orderData must be an object");
    }

    if (!orderData.productId) {
      throw new Error("Invalid order data: productId is required");
    }

    if (!orderData.userId) {
      throw new Error("Invalid order data: userId is required");
    }

    if (!orderData.userAddress) {
      throw new Error("Invalid order data: userAddress is required");
    }

    if (!orderData.chainId) {
      throw new Error("Invalid order data: chainId is required");
    }

    // 获取产品信息
    const post = await getPostById(orderData.productId);
    if (!post) {
      throw new Error(`产品 ${orderData.productId} 不存在`);
    }

    // 生成订单ID
    const { orderId } = generateOrderId(
      orderData.productId,
      orderData.userAddress
    );

    // 计算过期时间（默认1小时后过期）
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // 准备订单数据
    const newOrderData = {
      id: orderId,
      productId: orderData.productId,
      userId: orderData.userId,
      price: post.price,
      tokenAddress: post.tokenAddress || process.env.DEFAULT_TOKEN_ADDRESS,
      ownerAddress: post.ownerAddress,
      chainId: orderData.chainId,
      status: "pending",
      expiresAt,
    };

    // 生成签名
    const signature = await generateOrderSignature(newOrderData);
    newOrderData.signature = signature;

    // 创建订单
    const order = await createOrder(newOrderData);

    // 确保expiresAt字段存在于返回对象中
    if (!order.expiresAt) {
      order.expiresAt = expiresAt;
    }

    return order;
  } catch (error) {
    console.error("创建新订单失败:", error);
    throw new Error(`创建新订单失败: ${error.message}`);
  }
}

/**
 * 格式化数据库订单对象
 * @param {Object} dbOrder 数据库订单对象
 * @returns {Object} 格式化后的订单对象
 */
function formatOrderFromDb(dbOrder) {
  // 处理Prisma返回的对象
  const formattedOrder = {
    id: dbOrder.id,
    productId: dbOrder.post?.id || dbOrder.postId,
    userAddress: dbOrder.user?.id || dbOrder.userId,
    price: dbOrder.amount.toString(),
    status: dbOrder.status,
    transactionHash: dbOrder.txHash,
    createdAt: dbOrder.createdAt,
    updatedAt: dbOrder.updatedAt,
  };

  // 如果有关联的post对象，从中获取一些字段
  if (dbOrder.post) {
    formattedOrder.tokenAddress = dbOrder.post.tokenAddress;
    formattedOrder.ownerAddress = dbOrder.post.ownerAddress;
    formattedOrder.chainId = dbOrder.post.chainId;
  }

  // 返回格式化后的订单
  return formattedOrder;
}

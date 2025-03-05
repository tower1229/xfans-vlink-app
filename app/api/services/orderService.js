import { db } from "../lib/db";
import { OrderError } from "../../_utils/errors";

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
 * 验证订单数据
 * @param {Object} orderData - 订单数据
 * @throws {OrderError} 如果验证失败
 */
function validateOrderData(orderData) {
  if (!orderData || typeof orderData !== "object") {
    throw new OrderError("订单数据必须是一个对象", "INVALID_ORDER_DATA");
  }

  const requiredFields = ["productId", "userId", "chainId"];
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
    userId: dbOrder.userId,
    userAddress: dbOrder.user?.walletAddress || null,
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
    formattedOrder.post = {
      id: dbOrder.post.id,
      title: dbOrder.post.title,
      price: dbOrder.post.price.toString(),
      image: dbOrder.post.image,
    };
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
 * @param {string} userId 用户ID
 * @param {number|string} status 订单状态
 * @param {Object} options 分页选项
 * @returns {Promise<{orders: Array, total: number}>} 订单列表和总数
 */
export async function getOrdersByUser(userId, status, options = {}) {
  try {
    const { skip = 0, limit = 10 } = options;

    // 构建查询条件
    const query = { userId: userId };
    if (status !== undefined && status !== null && status !== "all") {
      query.status = parseInt(status);
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
        },
      }),
      db.order.count({ where: query }),
    ]);

    // 格式化订单数据
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      productId: order.post?.id || order.postId,
      userId: order.userId,
      price: order.amount.toString(),
      tokenAddress: order.post?.tokenAddress || null,
      chainId: order.post?.chainId || null,
      status: order.status,
      statusText: OrderStatusMap[order.status],
      transactionHash: order.txHash,
      createdAt: order.createdAt,
      expiresAt: order.expiresAt,
      isExpired:
        order.status === OrderStatus.EXPIRED ||
        (order.status === OrderStatus.PENDING &&
          new Date(order.expiresAt) < new Date()),
      post: order.post
        ? {
            id: order.post.id,
            title: order.post.title,
            price: order.post.price.toString(),
            image: order.post.image,
          }
        : null,
    }));

    return {
      orders: formattedOrders,
      total,
    };
  } catch (error) {
    console.error("获取用户订单列表失败:", error);
    throw new OrderError(
      `获取用户订单列表失败: ${error.message}`,
      "FETCH_ORDERS_ERROR"
    );
  }
}

/**
 * 创建新订单
 * @param {Object} orderData 订单数据
 * @returns {Promise<Object>} 创建的订单
 */
export async function createNewOrder(orderData) {
  try {
    // 验证订单数据
    validateOrderData(orderData);

    // 设置订单过期时间（默认30分钟）
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    // 创建订单记录
    const order = await db.order.create({
      data: {
        id: orderData.orderId,
        postId: orderData.productId,
        userId: orderData.userId,
        amount: orderData.price,
        status: OrderStatus.PENDING,
        expiresAt,
      },
    });

    return formatOrderFromDb(order);
  } catch (error) {
    console.error("创建订单失败:", error);
    if (error instanceof OrderError) throw error;
    throw new OrderError(
      `创建订单失败: ${error.message}`,
      "CREATE_ORDER_ERROR"
    );
  }
}

/**
 * 获取订单详情
 * @param {string} orderId 订单ID
 * @returns {Promise<Object>} 订单详情
 */
export async function getOrderById(orderId) {
  try {
    if (!orderId) {
      throw new OrderError("订单ID不能为空", "INVALID_ORDER_ID");
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        post: true,
        user: true,
      },
    });

    if (!order) {
      throw new OrderError("订单不存在", "ORDER_NOT_FOUND");
    }

    return formatOrderFromDb(order);
  } catch (error) {
    console.error("获取订单详情失败:", error);
    if (error instanceof OrderError) throw error;
    throw new OrderError(
      `获取订单详情失败: ${error.message}`,
      "FETCH_ORDER_ERROR"
    );
  }
}

/**
 * 更新订单状态
 * @param {string} orderId 订单ID
 * @param {number} status 订单状态
 * @param {string} txHash 交易哈希（可选）
 * @returns {Promise<Object>} 更新后的订单
 */
export async function updateOrderStatus(orderId, status, txHash = null) {
  try {
    if (!orderId) {
      throw new OrderError("订单ID不能为空", "INVALID_ORDER_ID");
    }

    if (status === undefined || status === null) {
      throw new OrderError("订单状态不能为空", "INVALID_ORDER_STATUS");
    }

    // 查找订单
    const existingOrder = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      throw new OrderError("订单不存在", "ORDER_NOT_FOUND");
    }

    // 更新订单状态
    const updateData = {
      status,
      updatedAt: new Date(),
    };

    // 如果提供了交易哈希，则更新
    if (txHash) {
      updateData.txHash = txHash;
    }

    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        post: true,
        user: true,
      },
    });

    return formatOrderFromDb(updatedOrder);
  } catch (error) {
    console.error("更新订单状态失败:", error);
    if (error instanceof OrderError) throw error;
    throw new OrderError(
      `更新订单状态失败: ${error.message}`,
      "UPDATE_ORDER_ERROR"
    );
  }
}

/**
 * 获取所有订单
 * @param {Object} options 分页选项
 * @returns {Promise<{orders: Array, total: number}>} 订单列表和总数
 */
export async function getAllOrders(options = {}) {
  try {
    const { skip = 0, limit = 10, status } = options;

    // 构建查询条件
    const where = {};
    if (status !== undefined && status !== null && status !== "all") {
      where.status = parseInt(status);
    }

    // 使用 Promise.all 并行查询数据和总数
    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          post: true,
          user: true,
        },
      }),
      db.order.count({ where }),
    ]);

    // 格式化订单数据
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      productId: order.post?.id || order.postId,
      userAddress: order.user?.walletAddress || null,
      userId: order.userId,
      price: order.amount.toString(),
      tokenAddress: order.post?.tokenAddress || null,
      chainId: order.post?.chainId || null,
      status: order.status,
      statusText: OrderStatusMap[order.status],
      transactionHash: order.txHash,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      expiresAt: order.expiresAt,
      post: order.post
        ? {
            id: order.post.id,
            title: order.post.title,
            price: order.post.price.toString(),
            image: order.post.image,
          }
        : null,
    }));

    return {
      orders: formattedOrders,
      total,
    };
  } catch (error) {
    console.error("获取所有订单失败:", error);
    throw new OrderError(
      `获取所有订单失败: ${error.message}`,
      "FETCH_ORDERS_ERROR"
    );
  }
}

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

  // 检查必需字段
  const requiredFields = ["productId", "userId"];
  for (const field of requiredFields) {
    if (!orderData[field]) {
      throw new OrderError(`缺少必要字段: ${field}`, "MISSING_REQUIRED_FIELD");
    }
  }

  // 验证字段格式
  if (
    typeof orderData.productId !== "string" ||
    orderData.productId.trim() === ""
  ) {
    throw new OrderError("产品ID格式无效", "INVALID_PRODUCT_ID");
  }

  if (typeof orderData.userId !== "string" || orderData.userId.trim() === "") {
    throw new OrderError("用户ID格式无效", "INVALID_USER_ID");
  }

  // 如果提供了orderId，验证其格式
  if (orderData.orderId !== undefined) {
    if (
      typeof orderData.orderId !== "string" ||
      orderData.orderId.trim() === ""
    ) {
      throw new OrderError("订单ID格式无效", "INVALID_ORDER_ID");
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
    console.log("getOrdersByUser - 开始获取用户订单");
    console.log("用户ID:", userId);
    console.log("订单状态:", status);
    console.log("查询选项:", options);

    const { skip = 0, limit = 10 } = options;

    // 构建查询条件
    const query = {
      userId: userId,
      // 移除status条件，先获取所有状态的订单
    };

    console.log("构建的查询条件:", JSON.stringify(query, null, 2));

    // 使用 Promise.all 并行查询数据和总数
    console.log("开始执行数据库查询");
    const [orders, total] = await Promise.all([
      db.order.findMany({
        where: query,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          post: {
            select: {
              id: true,
              title: true,
              price: true,
              image: true,
              tokenAddress: true,
              ownerAddress: true,
              chainId: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              walletAddress: true,
            },
          },
        },
      }),
      db.order.count({ where: query }),
    ]);

    console.log("数据库查询完成");
    // 转换BigInt为字符串
    const safeOrders = orders.map((order) => ({
      ...order,
      amount: order.amount.toString(),
      post: order.post
        ? {
            ...order.post,
            price: order.post.price.toString(),
          }
        : null,
    }));
    console.log("原始查询结果:", JSON.stringify(safeOrders, null, 2));
    console.log("查询到的订单数量:", orders.length);
    console.log("订单总数:", total);

    // 格式化订单数据
    const formattedOrders = orders.map((order) => {
      console.log("格式化订单:", order.id);
      return {
        id: order.id,
        productId: order.postId,
        userId: order.userId,
        price: order.amount.toString(), // 确保转换BigInt
        tokenAddress: order.post?.tokenAddress || null,
        chainId: order.post?.chainId || null,
        status: order.status,
        statusText: OrderStatusMap[order.status] || "未知状态",
        transactionHash: order.txHash || null,
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
              price: order.post.price.toString(), // 确保转换BigInt
              image: order.post.image,
            }
          : null,
        user: order.user
          ? {
              id: order.user.id,
              username: order.user.username,
              walletAddress: order.user.walletAddress,
            }
          : null,
      };
    });

    console.log("订单数据格式化完成");
    console.log(
      "格式化后的订单数据:",
      JSON.stringify(formattedOrders, null, 2)
    );

    return {
      orders: formattedOrders,
      total,
    };
  } catch (error) {
    console.error("获取用户订单列表失败:", error);
    console.error("错误堆栈:", error.stack);
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

    // 获取产品信息
    const post = await db.post.findUnique({
      where: { id: orderData.productId },
    });

    if (!post) {
      throw new OrderError("产品不存在", "PRODUCT_NOT_FOUND");
    }

    // 创建订单记录
    const order = await db.order.create({
      data: {
        id: orderData.orderId, // 使用传入的orderId
        postId: orderData.productId,
        userId: orderData.userId,
        amount: post.price, // 使用产品价格
        status: OrderStatus.PENDING, // 确保设置初始状态
        expiresAt,
      },
      include: {
        // 包含关联数据
        post: true,
        user: true,
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
    } else {
      // 如果没有指定状态，默认查询所有非过期状态的订单
      where.status = {
        not: OrderStatus.EXPIRED,
      };
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

import { NextResponse } from "next/server";
import {
  getOrderById,
  createNewOrder,
  updateOrderStatus,
  getOrdersByUser,
  updateExpiredOrders,
  getAllOrders,
  OrderStatus,
  OrderStatusMap,
} from "../services/orderService";
import { getPostById } from "../utils/postUtils";
import { OrderError } from "../../_utils/errors";
import { keccak256 } from "viem";
import { verifyJwtToken } from "../utils/userUtils";
import { redis } from "../utils/redis.mjs";
import {
  encodeAbiParameters,
  parseAbiParameters,
  signOrderMessage,
  buildPaymentTransaction,
  generateOrderId,
} from "../utils/orderUtils";

/**
 * 统一的响应格式化函数
 */
function formatResponse(success, data = null, error = null) {
  return NextResponse.json({
    success,
    data,
    ...(error && { error: { message: error.message, code: error.code } }),
  });
}

/**
 * 创建订单
 * @param {Request} request 请求对象
 * @param {Object} data 订单数据
 * @returns {Promise<Response>} 响应对象
 */
export async function createOrderController(request, data) {
  try {
    const user = request.user; // 从认证中间件获取

    if (!user?.userId) {
      return formatResponse(
        false,
        null,
        new OrderError("未授权访问", "UNAUTHORIZED")
      );
    }

    const { productId } = data;
    const userId = user.userId;

    // 检查产品是否存在
    const product = await getPostById(productId);
    if (!product) {
      throw new OrderError("产品不存在", "PRODUCT_NOT_FOUND");
    }

    // 创建订单
    const orderData = {
      productId,
      userId,
      orderId: generateOrderId(), // 使用我们修改过的 generateOrderId 函数
    };

    const order = await createNewOrder(orderData);

    // 构建支付交易数据
    const timestamp = Math.floor(Date.now() / 1000);

    // 确保订单ID是64个字符（32字节）
    if (order.id.replace(/-/g, "").length !== 64) {
      throw new OrderError(
        "订单ID格式错误：必须是32字节长度",
        "INVALID_ORDER_ID_LENGTH"
      );
    }

    const encodedOrderData = encodeAbiParameters(
      parseAbiParameters("bytes32, uint256, address, address, uint32, uint64"),
      [
        `0x${order.id.replace(/-/g, "")}`, // 直接使用完整的32字节订单ID
        BigInt(order.price.toString()),
        order.tokenAddress,
        order.ownerAddress,
        timestamp,
        BigInt(order.chainId),
      ]
    );

    // 计算消息哈希并签名
    const messageHash = keccak256(encodedOrderData);
    const signature = await signOrderMessage(messageHash);

    // 构建支付交易
    const transaction = await buildPaymentTransaction(
      order,
      encodedOrderData,
      signature
    );

    return formatResponse(true, {
      order,
      transaction,
    });
  } catch (error) {
    console.error("创建订单失败:", error);
    return formatResponse(
      false,
      null,
      error instanceof OrderError
        ? error
        : new OrderError("创建订单失败", "INTERNAL_ERROR")
    );
  }
}

/**
 * 获取订单详情
 * @param {Request} request 请求对象
 * @param {string} orderId 订单ID
 * @returns {Promise<Response>} 响应对象
 */
export async function getOrderByIdController(request, orderId) {
  // 从令牌中获取用户信息
  const user = await verifyJwtToken(request.token);

  // 获取订单信息
  const order = await getOrderById(orderId);
  if (!order) {
    throw new NotFoundError("订单不存在");
  }

  // 检查是否是当前用户的订单或卖家
  if (
    order.userId !== user.userId &&
    order.ownerAddress !== user.walletAddress
  ) {
    throw new UnauthorizedError("您没有权限查看此订单");
  }

  // 返回订单信息
  return NextResponse.json({
    success: true,
    data: {
      id: order.id,
      productId: order.productId,
      userId: order.userId,
      userAddress: order.userAddress,
      price: order.price.toString(),
      tokenAddress: order.tokenAddress,
      ownerAddress: order.ownerAddress,
      chainId: order.chainId,
      status: order.status,
      transactionHash: order.transactionHash,
      createdAt: order.createdAt,
      expiresAt: order.expiresAt,
      isExpired: order.expiresAt < new Date() && order.status === "pending",
    },
  });
}

/**
 * 更新订单状态
 * @param {Request} request 请求对象
 * @param {string} orderId 订单ID
 * @param {Object} data 更新数据
 * @returns {Promise<Response>} 响应对象
 */
export async function updateOrderStatusController(request, orderId, data) {
  // 获取订单信息
  const order = await getOrderById(orderId);
  if (!order) {
    throw new NotFoundError("订单不存在");
  }

  const { status, transactionHash } = data;

  // 验证状态 - 允许更新为已关闭或已完成状态
  const statusMap = {
    closed: OrderStatus.CLOSED,
    completed: OrderStatus.COMPLETED,
  };

  const newStatus = statusMap[status];
  if (newStatus === undefined) {
    throw new ValidationError("订单只能被更新为已关闭或已完成状态");
  }

  // 验证当前订单状态
  if (
    newStatus === OrderStatus.CLOSED &&
    order.status !== OrderStatus.PENDING
  ) {
    throw new ValidationError("只有待支付状态的订单可以被关闭");
  }

  if (
    newStatus === OrderStatus.COMPLETED &&
    order.status !== OrderStatus.PENDING
  ) {
    throw new ValidationError("只有待支付状态的订单可以被标记为已完成");
  }

  // 如果是完成状态，需要提供交易哈希
  if (newStatus === OrderStatus.COMPLETED && !transactionHash) {
    throw new ValidationError("更新为已完成状态时必须提供交易哈希");
  }

  // 更新订单状态和交易哈希（如果有）
  const updatedOrder = await updateOrderStatus(
    orderId,
    newStatus,
    newStatus === OrderStatus.COMPLETED ? transactionHash : null
  );

  // 返回更新后的订单
  return formatResponse(true, {
    id: updatedOrder.id,
    status: updatedOrder.status,
    statusText: OrderStatusMap[updatedOrder.status],
    productId: updatedOrder.productId,
    userAddress: updatedOrder.userAddress,
    transactionHash: updatedOrder.transactionHash,
    createdAt: updatedOrder.createdAt,
    expiresAt: updatedOrder.expiresAt,
  });
}

/**
 * 获取用户订单列表
 * @param {Request} request 请求对象
 * @param {string} userId 用户ID
 * @param {Object} options 分页选项
 * @returns {Promise<Response>} 响应对象
 */
export async function getUserOrdersController(request, userId, options = {}) {
  try {
    console.log("开始获取用户订单列表");
    console.log("用户ID:", userId);
    console.log("请求选项:", options);

    const { page = 1, pageSize = 10, status } = options;

    // 参数验证
    if (!userId) {
      console.log("错误: 用户ID为空");
      throw new ValidationError("用户ID不能为空", "MISSING_USER_ID");
    }

    if (page < 1) {
      console.log("错误: 无效的页码:", page);
      throw new ValidationError("页码必须大于0", "INVALID_PAGE_NUMBER");
    }

    if (pageSize < 1 || pageSize > 100) {
      console.log("错误: 无效的每页数量:", pageSize);
      throw new ValidationError("每页数量必须在1-100之间", "INVALID_PAGE_SIZE");
    }

    // 构建缓存键
    const cacheKey = `orders:${userId}:${status}:${page}:${pageSize}`;
    console.log("缓存键:", cacheKey);

    // 暂时禁用缓存，直接从数据库获取数据
    console.log("跳过缓存，直接从数据库获取数据");

    // 检查请求频率
    const rateLimitKey = `ratelimit:orders:${userId}`;
    const requestCount = await redis.incr(rateLimitKey);
    console.log("当前请求次数:", requestCount);

    if (requestCount === 1) {
      await redis.expire(rateLimitKey, 60); // 60秒过期
    }
    if (requestCount > 30) {
      // 每分钟最多30次请求
      console.log("请求频率超限");
      throw new Error("请求过于频繁，请稍后再试");
    }

    // 更新过期订单（不阻塞主流程）
    updateExpiredOrders().catch(console.error);

    // 计算分页参数
    const skip = (page - 1) * pageSize;
    console.log("查询参数:", { skip, limit: pageSize, status });

    // 获取用户订单
    const { orders, total } = await getOrdersByUser(userId, status, {
      skip,
      limit: pageSize,
    });

    console.log("查询到的订单数量:", orders.length);
    console.log("总订单数:", total);

    const result = {
      orders,
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      totalItems: total,
    };

    // 暂时注释掉缓存逻辑
    // await redis.set(cacheKey, JSON.stringify(result), "EX", 10);
    // console.log("查询结果已缓存");

    return formatResponse(true, result);
  } catch (error) {
    console.error("获取用户订单列表失败:", error);
    console.error("错误堆栈:", error.stack);
    return formatResponse(
      false,
      null,
      error instanceof OrderError
        ? error
        : new OrderError(
            `获取用户订单列表失败: ${error.message}`,
            "FETCH_ORDERS_ERROR"
          )
    );
  }
}

/**
 * 获取所有订单
 * @param {Request} request 请求对象
 * @param {Object} options 分页选项
 * @returns {Promise<Response>} 响应对象
 */
export async function getAllOrdersController(request, options = {}) {
  try {
    // 获取查询参数
    const { page = 1, pageSize = 10, status } = options;

    // 更新过期订单（不阻塞主流程）
    updateExpiredOrders().catch(console.error);

    // 计算分页参数
    const skip = (page - 1) * pageSize;

    // 获取所有订单
    const { orders, total } = await getAllOrders({
      skip,
      limit: pageSize,
      status,
    });

    const result = {
      orders,
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      totalItems: total,
    };

    return formatResponse(true, result);
  } catch (error) {
    console.error("获取订单列表失败:", error);
    return formatResponse(
      false,
      null,
      error instanceof OrderError
        ? error
        : new OrderError("获取订单列表失败", "INTERNAL_ERROR")
    );
  }
}

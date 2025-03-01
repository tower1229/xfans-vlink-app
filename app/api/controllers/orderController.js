import { NextResponse } from "next/server";
import {
  getOrderById,
  createNewOrder,
  updateOrderStatus,
  getOrdersByUser,
  updateExpiredOrders,
  getPostById,
  getAllOrders,
} from "@/utils";
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from "../middleware/errorHandler";
import {
  isAddress,
  encodeFunctionData,
  encodeAbiParameters,
  parseAbiParameters,
  keccak256,
  toHex,
} from "viem";
import { signMessage } from "viem/accounts";
import { verifyJwtToken, checkUserExists } from "../../utils/userUtils";

/**
 * 创建订单
 * @param {Request} request 请求对象
 * @param {Object} data 订单数据
 * @returns {Promise<Response>} 响应对象
 */
export async function createOrderController(request, data) {
  // 从令牌中获取用户信息
  const user = verifyJwtToken(request.token);
  if (!user) {
    throw new UnauthorizedError("请先登录");
  }
  console.log("JWT用户信息:", user); // 添加日志以查看用户信息结构

  const { productId, chainId } = data;
  const userAddress = user.walletAddress; // 使用当前用户的钱包地址
  const userId = user.userId; // JWT中的用户ID字段

  // 验证用户地址
  if (!isAddress(userAddress)) {
    throw new ValidationError("无效的用户地址");
  }

  // 检查用户是否存在
  const userExists = await checkUserExists(userId);
  if (!userExists) {
    throw new NotFoundError(`用户ID ${userId} 不存在，请先创建用户账户`);
  }

  // 检查产品是否存在
  const product = await getPostById(productId);
  if (!product) {
    throw new NotFoundError("产品不存在");
  }

  console.log(
    `创建订单: 产品ID=${productId}, 用户ID=${userId}, 用户钱包地址=${userAddress}`
  );

  // 创建订单 - 不包含签名
  const order = await createNewOrder({
    productId,
    userId, // userId
    userAddress, // userAddress
    chainId,
  });

  // 获取当前时间戳（秒）
  const timestamp = Math.floor(Date.now() / 1000);

  // 按照指定格式编码orderData
  const encodedOrderData = encodeAbiParameters(
    parseAbiParameters("bytes32, uint256, address, address, uint32, uint64"),
    [
      order.id, // orderId (bytes32)
      BigInt(order.price.toString()), // amount (uint256)
      order.tokenAddress, // token (address)
      order.ownerAddress, // sellerAddress (address)
      timestamp, // timestamp (uint32)
      BigInt(order.chainId), // chainId (uint64)
    ]
  );

  // 计算消息哈希
  const messageHash = keccak256(encodedOrderData);

  // 签名消息 - 不使用 raw 选项，让 viem 自动添加以太坊签名前缀
  let signature;
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

    // 使用 messageHash 作为普通消息签名，viem 会自动添加前缀
    signature = await signMessage({
      message: { raw: messageHash }, // 使用 messageHash 作为原始字节数据
      privateKey: formattedPrivateKey,
    });
  } catch (error) {
    console.error("生成订单签名失败:", error.message);
    throw new ValidationError(`签名生成失败: ${error.message}`);
  }

  // 定义支付合约地址
  const PAYMENT_CONTRACT_ADDRESS =
    process.env.PAYMENT_CONTRACT_ADDRESS ||
    "0x1234567890123456789012345678901234567890";

  // 构建EVM交易对象
  let transaction;

  // 根据支付方式构建不同的交易
  if (order.tokenAddress === "0x0000000000000000000000000000000000000000") {
    // ETH支付 - 构建payWithNative交易
    transaction = {
      to: PAYMENT_CONTRACT_ADDRESS, // 合约地址
      value: order.price.toString(), // 支付金额
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
    transaction = {
      to: PAYMENT_CONTRACT_ADDRESS, // 合约地址
      value: "0", // 不发送ETH
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
          order.tokenAddress,
          BigInt(order.price.toString()),
          encodedOrderData,
          signature,
        ],
      }),
      chainId: order.chainId,
    };
  }

  // 返回交易参数
  return NextResponse.json(
    {
      success: true,
      data: {
        transaction: transaction,
      },
    },
    { status: 201 }
  );
}

/**
 * 获取订单详情
 * @param {Request} request 请求对象
 * @param {string} orderId 订单ID
 * @returns {Promise<Response>} 响应对象
 */
export async function getOrderByIdController(request, orderId) {
  // 从令牌中获取用户信息
  const user = verifyJwtToken(request.token);

  // 获取订单信息
  const order = await getOrderById(orderId);
  if (!order) {
    throw new NotFoundError("订单不存在");
  }

  // 检查是否是当前用户的订单
  if (
    order.userAddress !== user.walletAddress &&
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

  // 验证状态 - 允许更新为 closed 或 completed 状态
  if (status !== "closed" && status !== "completed") {
    throw new ValidationError(
      "订单只能被更新为已关闭(closed)或已完成(completed)状态"
    );
  }

  // 验证当前订单状态
  if (status === "closed" && order.status !== "pending") {
    throw new ValidationError("只有待支付(pending)状态的订单可以被关闭");
  }

  if (status === "completed" && order.status !== "pending") {
    throw new ValidationError(
      "只有待支付(pending)状态的订单可以被标记为已完成"
    );
  }

  // 如果是完成状态，需要提供交易哈希
  if (status === "completed" && !transactionHash) {
    throw new ValidationError("更新为已完成状态时必须提供交易哈希");
  }

  // 更新订单状态和交易哈希（如果有）
  const updatedOrder = await updateOrderStatus(
    orderId,
    status,
    transactionHash
  );

  // 返回更新后的订单
  return NextResponse.json({
    success: true,
    data: {
      id: updatedOrder.id,
      status: updatedOrder.status,
      productId: updatedOrder.productId,
      userAddress: updatedOrder.userAddress,
      transactionHash: updatedOrder.transactionHash,
      createdAt: updatedOrder.createdAt,
      expiresAt: updatedOrder.expiresAt,
    },
  });
}

/**
 * 获取用户订单列表
 * @param {Request} request 请求对象
 * @param {string} userAddress 用户地址
 * @returns {Promise<Response>} 响应对象
 */
export async function getUserOrdersController(request, userAddress) {
  // 验证用户地址
  if (!isAddress(userAddress)) {
    throw new ValidationError("无效的用户地址");
  }

  // 先更新所有过期订单
  await updateExpiredOrders();

  // 获取用户订单列表
  const orders = await getOrdersByUser(userAddress);

  // 格式化订单数据
  const formattedOrders = orders.map((order) => ({
    id: order.id,
    productId: order.productId,
    price: order.price.toString(),
    tokenAddress: order.tokenAddress,
    chainId: order.chainId,
    status: order.status,
    transactionHash: order.transactionHash,
    createdAt: order.createdAt,
    expiresAt: order.expiresAt,
    isExpired: order.expiresAt < new Date() && order.status === "pending",
  }));

  return NextResponse.json({
    success: true,
    data: formattedOrders,
  });
}

/**
 * 获取所有订单列表
 * @param {Request} request 请求对象
 * @returns {Promise<Response>} 响应对象
 */
export async function getAllOrdersController(request) {
  try {
    // 从令牌中获取用户信息
    const user = verifyJwtToken(request.token);

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // 获取当前用户的订单
    const orders = await getOrdersByUser(user.walletAddress, status);

    // 格式化订单数据
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      productId: order.productId,
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
    }));

    // 返回订单列表
    return NextResponse.json({
      success: true,
      data: formattedOrders,
    });
  } catch (error) {
    console.error("获取所有订单失败:", error);
    throw error;
  }
}

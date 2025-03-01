import { NextResponse } from "next/server";
import { UnauthorizedError } from "./errorHandler";
import { isAddress } from "viem";
import { verifyJwtToken } from "../../utils/userUtils";

/**
 * 从请求中获取用户信息
 * @param {Request} request 请求对象
 * @returns {Object|null} 用户信息或null
 */
function getUserFromRequest(request) {
  // 从Authorization头获取JWT令牌
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const decoded = verifyJwtToken(token);
    if (decoded) {
      return {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role,
        walletAddress: decoded.walletAddress,
      };
    }
  }

  // 兼容旧的钱包地址认证方式
  // 从Authorization头获取钱包地址
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (isAddress(token)) {
      return {
        walletAddress: token,
      };
    }
  }

  // 从查询参数获取钱包地址
  const url = new URL(request.url);
  const address = url.searchParams.get("address");
  if (address && isAddress(address)) {
    return {
      walletAddress: address,
    };
  }

  // 从Cookie获取钱包地址
  const cookies = request.headers.get("cookie");
  if (cookies) {
    const addressMatch = cookies.match(/userAddress=([^;]+)/);
    if (addressMatch && isAddress(addressMatch[1])) {
      return {
        walletAddress: addressMatch[1],
      };
    }
  }

  return null;
}

/**
 * 需要身份验证的中间件
 * @param {Request} request 请求对象
 * @param {Function} next 下一个处理函数
 * @returns {Promise<Response>} 响应对象
 */
export async function withAuth(request, next) {
  // 获取用户信息
  const user = getUserFromRequest(request);

  // 如果没有用户信息，返回未授权错误
  if (!user) {
    throw new UnauthorizedError("需要身份验证");
  }

  // 将用户信息添加到请求对象
  const authenticatedRequest = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });

  // 添加用户信息
  authenticatedRequest.user = user;

  // 兼容旧的钱包地址认证方式
  if (user.walletAddress) {
    authenticatedRequest.userAddress = user.walletAddress;
  }

  // 调用下一个处理函数
  return await next(authenticatedRequest);
}

/**
 * 需要管理员权限的中间件
 * @param {Request} request 请求对象
 * @param {Function} next 下一个处理函数
 * @returns {Promise<Response>} 响应对象
 */
export async function withAdminAuth(request, next) {
  // 获取用户信息
  const user = getUserFromRequest(request);

  // 如果没有用户信息，返回未授权错误
  if (!user) {
    throw new UnauthorizedError("需要身份验证");
  }

  // 如果不是管理员，返回未授权错误
  if (!user.role || user.role !== "admin") {
    throw new UnauthorizedError("需要管理员权限");
  }

  // 将用户信息添加到请求对象
  const authenticatedRequest = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });

  // 添加用户信息
  authenticatedRequest.user = user;

  // 兼容旧的钱包地址认证方式
  if (user.walletAddress) {
    authenticatedRequest.userAddress = user.walletAddress;
  }

  // 调用下一个处理函数
  return await next(authenticatedRequest);
}

/**
 * 可选身份验证的中间件
 * @param {Request} request 请求对象
 * @param {Function} next 下一个处理函数
 * @returns {Promise<Response>} 响应对象
 */
export async function withOptionalAuth(request, next) {
  // 获取用户信息
  const user = getUserFromRequest(request);

  // 将用户信息添加到请求对象（如果有）
  const authenticatedRequest = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });

  if (user) {
    // 添加用户信息
    authenticatedRequest.user = user;

    // 兼容旧的钱包地址认证方式
    if (user.walletAddress) {
      authenticatedRequest.userAddress = user.walletAddress;
    }
  }

  // 调用下一个处理函数
  return await next(authenticatedRequest);
}

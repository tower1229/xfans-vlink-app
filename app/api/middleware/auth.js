import { NextResponse } from "next/server";
import { UnauthorizedError } from "./errorHandler";
import { isAddress } from "viem";

/**
 * 从请求中获取用户地址
 * @param {Request} request 请求对象
 * @returns {string|null} 用户地址或null
 */
function getUserAddressFromRequest(request) {
  // 从Authorization头获取
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (isAddress(token)) {
      return token;
    }
  }

  // 从查询参数获取
  const url = new URL(request.url);
  const address = url.searchParams.get("address");
  if (address && isAddress(address)) {
    return address;
  }

  // 从Cookie获取
  const cookies = request.headers.get("cookie");
  if (cookies) {
    const addressMatch = cookies.match(/userAddress=([^;]+)/);
    if (addressMatch && isAddress(addressMatch[1])) {
      return addressMatch[1];
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
  // 获取用户地址
  const userAddress = getUserAddressFromRequest(request);

  // 如果没有用户地址，返回未授权错误
  if (!userAddress) {
    throw new UnauthorizedError("需要身份验证");
  }

  // 将用户地址添加到请求对象
  const authenticatedRequest = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
  authenticatedRequest.userAddress = userAddress;

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
  // 获取用户地址
  const userAddress = getUserAddressFromRequest(request);

  // 将用户地址添加到请求对象（如果有）
  const authenticatedRequest = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });

  if (userAddress) {
    authenticatedRequest.userAddress = userAddress;
  }

  // 调用下一个处理函数
  return await next(authenticatedRequest);
}

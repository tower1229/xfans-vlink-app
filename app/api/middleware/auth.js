import { NextResponse } from "next/server";
import { verifyJwtToken } from "../utils/userUtils";
import { UnauthorizedError } from "../../_utils/errors";

/**
 * 从请求中获取令牌
 * @param {Request} request 请求对象
 * @returns {string|null} JWT令牌或null
 */
function getTokenFromRequest(request) {
  // 从Authorization头获取JWT令牌
  const authHeader = request.headers.get("Authorization");
  console.log("Authorization头:", authHeader);

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    console.log("提取的令牌:", token.substring(0, 10) + "...");
    return token;
  } else {
    console.log("Authorization头不存在或格式不正确");
    return null;
  }
}

/**
 * 需要身份验证的中间件
 * @param {Request} request 请求对象
 * @param {Function} next 下一个处理函数
 * @returns {Promise<Response>} 响应对象
 */
export async function withAuth(request, next) {
  console.log("withAuth中间件开始处理请求");

  // 获取令牌
  const token = getTokenFromRequest(request);
  console.log(
    "从请求中获取的令牌:",
    token ? token.substring(0, 10) + "..." : null
  );

  // 验证令牌
  if (!token) {
    console.log("未找到令牌，抛出未授权错误");
    throw new UnauthorizedError("需要身份验证");
  }

  const user = await verifyJwtToken(token);
  if (!user) {
    console.log("令牌验证失败，抛出未授权错误");
    throw new UnauthorizedError("无效的身份验证令牌");
  }

  // 创建新的请求对象，并将令牌和用户信息添加到请求对象
  const clonedRequest = request.clone();
  console.log("已克隆请求对象");

  // 使用Object.defineProperty确保token属性被正确添加
  Object.defineProperty(clonedRequest, "token", {
    value: token,
    writable: false,
    enumerable: true,
    configurable: true,
  });
  console.log("已将令牌添加到请求对象");

  // 使用Object.defineProperty确保user属性被正确添加
  Object.defineProperty(clonedRequest, "user", {
    value: user,
    writable: false,
    enumerable: true,
    configurable: true,
  });
  console.log("已将用户信息添加到请求对象");

  // 调用下一个处理函数
  console.log("调用下一个处理函数");
  return await next(clonedRequest);
}

/**
 * 需要管理员权限的中间件
 * @param {Request} request 请求对象
 * @param {Function} next 下一个处理函数
 * @returns {Promise<Response>} 响应对象
 */
export async function withAdminAuth(request, next) {
  // 获取令牌
  const token = getTokenFromRequest(request);

  // 验证令牌
  if (!token) {
    throw new UnauthorizedError("需要身份验证");
  }

  const user = await verifyJwtToken(token);
  if (!user) {
    throw new UnauthorizedError("无效的身份验证令牌");
  }

  // 如果不是管理员，返回未授权错误
  if (user.role !== "admin") {
    throw new UnauthorizedError("需要管理员权限");
  }

  // 创建新的请求对象，并将令牌和用户信息添加到请求对象
  const clonedRequest = request.clone();

  // 使用Object.defineProperty确保token属性被正确添加
  Object.defineProperty(clonedRequest, "token", {
    value: token,
    writable: false,
    enumerable: true,
    configurable: true,
  });

  // 使用Object.defineProperty确保user属性被正确添加
  Object.defineProperty(clonedRequest, "user", {
    value: user,
    writable: false,
    enumerable: true,
    configurable: true,
  });

  // 调用下一个处理函数
  return await next(clonedRequest);
}

/**
 * 可选身份验证的中间件
 * @param {Request} request 请求对象
 * @param {Function} next 下一个处理函数
 * @returns {Promise<Response>} 响应对象
 */
export async function withOptionalAuth(request, next) {
  // 获取令牌
  const token = getTokenFromRequest(request);

  // 创建新的请求对象
  const clonedRequest = request.clone();

  if (token) {
    // 验证令牌
    const user = await verifyJwtToken(token);

    if (user) {
      // 使用Object.defineProperty确保token属性被正确添加
      Object.defineProperty(clonedRequest, "token", {
        value: token,
        writable: false,
        enumerable: true,
        configurable: true,
      });

      // 使用Object.defineProperty确保user属性被正确添加
      Object.defineProperty(clonedRequest, "user", {
        value: user,
        writable: false,
        enumerable: true,
        configurable: true,
      });
    }
  }

  // 调用下一个处理函数
  return await next(clonedRequest);
}

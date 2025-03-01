// 导出所有中间件
import { NextResponse } from "next/server";
export * from "./auth";
export * from "./errorHandler";
export * from "./validation";
export * from "./logger";
export * from "./eventListenerAuth";

// 组合中间件
import { withAuth, withOptionalAuth, withAdminAuth } from "./auth";
import { withErrorHandler } from "./errorHandler";
import { withLogger } from "./logger";
import { verifyEventListenerRequest } from "./eventListenerAuth";

/**
 * 组合多个中间件
 * @param {...Function} middlewares 中间件函数
 * @returns {Function} 组合后的中间件函数
 */
export function compose(...middlewares) {
  return (handler) => {
    // 确保handler是一个函数
    if (typeof handler !== "function") {
      throw new Error("Handler must be a function");
    }

    return async (request, ...args) => {
      // 创建中间件链
      const chain = middlewares.reduceRight(
        (next, middleware) => {
          return async (req) => middleware(req, next);
        },
        async (req) => handler(req, ...args)
      );

      // 执行中间件链
      return await chain(request);
    };
  };
}

/**
 * 公共API中间件（包含错误处理和日志记录）
 */
export function withAPI(handler) {
  // 确保handler是一个函数
  if (typeof handler !== "function") {
    throw new Error("Handler must be a function");
  }

  return compose(withErrorHandler, withLogger)(handler);
}

/**
 * 需要身份验证的API中间件
 */
export function withAuthAPI(handler) {
  return compose(withErrorHandler, withLogger, withAuth)(handler);
}

/**
 * 需要管理员权限的API中间件
 */
export function withAdminAPI(handler) {
  return compose(withErrorHandler, withLogger, withAdminAuth)(handler);
}

/**
 * 可选身份验证的API中间件
 */
export function withOptionalAuthAPI(handler) {
  return compose(withErrorHandler, withLogger, withOptionalAuth)(handler);
}

/**
 * 事件监听器API中间件
 */
export function withEventListenerAuth(handler) {
  return async (request, ...args) => {
    // 验证事件监听器请求
    const authResult = verifyEventListenerRequest(request);
    if (authResult) {
      return authResult; // 返回错误响应
    }

    // 验证通过，继续处理请求
    return await handler(request, ...args);
  };
}

/**
 * 事件监听器API中间件（包含错误处理和日志记录）
 */
export function withEventListenerAPI(handler) {
  return async (request, ...args) => {
    try {
      // 使用compose组合中间件
      const wrappedHandler = compose(
        withErrorHandler,
        withLogger,
        withEventListenerAuth
      )(handler);
      // 确保返回响应
      const response = await wrappedHandler(request, ...args);
      if (!response) {
        console.error("Handler did not return a response");
        return new NextResponse(
          JSON.stringify({ success: false, error: "Internal server error" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      return response;
    } catch (error) {
      console.error("Middleware error:", error);
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Internal server error",
          },
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  };
}

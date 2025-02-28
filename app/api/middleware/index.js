// 导出所有中间件
export * from "./auth";
export * from "./errorHandler";
export * from "./validation";
export * from "./logger";

// 组合中间件
import { withAuth, withOptionalAuth } from "./auth";
import { withErrorHandler } from "./errorHandler";
import { withLogger } from "./logger";

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
 * 可选身份验证的API中间件
 */
export function withOptionalAuthAPI(handler) {
  return compose(withErrorHandler, withLogger, withOptionalAuth)(handler);
}

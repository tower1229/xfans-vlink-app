import { NextResponse } from "next/server";

/**
 * 统一错误处理中间件
 * @param {Request} request 请求对象
 * @param {Function} next 下一个处理函数
 * @returns {Promise<Response>} 响应对象
 */
export async function withErrorHandler(request, next) {
  try {
    // 调用下一个处理函数
    return await next(request);
  } catch (error) {
    console.error("API错误:", error);

    // 确定错误代码和状态码
    let errorCode = "INTERNAL_SERVER_ERROR";
    let statusCode = 500;
    let message = error.message || "服务器内部错误";

    // 根据错误类型设置不同的错误代码和状态码
    if (error.name === "ValidationError") {
      errorCode = "VALIDATION_ERROR";
      statusCode = 400;
    } else if (error.name === "NotFoundError") {
      errorCode = "NOT_FOUND";
      statusCode = 404;
    } else if (error.name === "UnauthorizedError") {
      errorCode = "UNAUTHORIZED";
      statusCode = 401;
    } else if (error.name === "ForbiddenError") {
      errorCode = "FORBIDDEN";
      statusCode = 403;
    }

    // 返回错误响应
    return NextResponse.json(
      {
        success: false,
        error: {
          code: errorCode,
          message: message,
        },
      },
      { status: statusCode }
    );
  }
}

/**
 * 自定义错误类：验证错误
 */
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * 自定义错误类：资源不存在错误
 */
export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
  }
}

/**
 * 自定义错误类：未授权错误
 */
export class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * 自定义错误类：禁止访问错误
 */
export class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = "ForbiddenError";
  }
}

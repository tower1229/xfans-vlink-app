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
 * 自定义错误基类
 */
class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 验证错误
 */
export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

/**
 * 未找到资源错误
 */
export class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404, "NOT_FOUND");
  }
}

/**
 * 未授权错误
 */
export class UnauthorizedError extends AppError {
  constructor(message) {
    super(message, 401, "UNAUTHORIZED");
  }
}

/**
 * 禁止访问错误
 */
export class ForbiddenError extends AppError {
  constructor(message) {
    super(message, 403, "FORBIDDEN");
  }
}

/**
 * 冲突错误
 */
export class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, "CONFLICT");
  }
}

/**
 * 服务器错误
 */
export class ServerError extends AppError {
  constructor(message) {
    super(message, 500, "SERVER_ERROR");
  }
}

export default {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ServerError,
};

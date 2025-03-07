import { NextResponse } from "next/server";
import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from "../../_utils/errors";

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
    if (error instanceof AppError) {
      errorCode = error.code;

      // 根据错误类型设置状态码
      if (error instanceof ValidationError) {
        statusCode = 400;
      } else if (error instanceof NotFoundError) {
        statusCode = 404;
      } else if (error instanceof UnauthorizedError) {
        statusCode = 401;
      } else if (error instanceof ForbiddenError) {
        statusCode = 403;
      } else {
        statusCode = 500;
      }
    }

    // 返回错误响应
    return NextResponse.json(
      {
        success: false,
        message: message,
      },
      { status: statusCode }
    );
  }
}

// 导出错误类型，以便向后兼容
export { ValidationError, NotFoundError, UnauthorizedError, ForbiddenError };

export default {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
};

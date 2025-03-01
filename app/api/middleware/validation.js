import { NextResponse } from "next/server";
import { ValidationError } from "./errorHandler";

/**
 * 请求验证中间件
 * @param {Object} schema 验证模式
 * @returns {Function} 中间件函数
 */
export function withValidation(schema) {
  return (handler) => {
    return async (request, ...args) => {
      try {
        // 获取请求体 - 修复 request.json 不是函数的问题
        let body;

        // 检查是否是GET请求，GET请求通常没有请求体
        if (request.method === "GET") {
          body = {};
        } else {
          try {
            // 尝试使用 request.json() 方法
            body = await request.json();
          } catch (jsonError) {
            // 如果 request.json() 不可用或失败
            if (request.body && typeof request.body === "object") {
              body = request.body;
            } else if (typeof request.body === "string") {
              try {
                body = JSON.parse(request.body);
              } catch (parseError) {
                // 如果JSON解析失败，尝试从URL参数获取数据
                const url = new URL(request.url);
                const params = Object.fromEntries(url.searchParams.entries());
                if (Object.keys(params).length > 0) {
                  body = params;
                } else {
                  // 如果没有请求体也没有URL参数，使用空对象
                  body = {};
                }
              }
            } else {
              // 如果没有请求体，使用空对象
              body = {};
            }
          }
        }

        // 验证请求体
        const result = schema.safeParse(body);

        if (!result.success) {
          // 格式化验证错误
          const formattedErrors = formatZodErrors(result.error);

          return NextResponse.json(
            {
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: "请求数据验证失败",
                details: formattedErrors,
              },
            },
            { status: 400 }
          );
        }

        // 创建一个新的请求对象，包含验证后的数据
        const validatedRequest = new Request(request.url, {
          method: request.method,
          headers: request.headers,
          body: JSON.stringify(result.data),
        });

        // 添加验证后的数据到请求对象
        validatedRequest.validatedData = result.data;

        // 调用处理函数 - 修复这里，直接调用handler而不是args[0]
        return await handler(validatedRequest, ...args);
      } catch (error) {
        console.error("请求验证错误:", error);

        if (error.message === "Failed to parse JSON") {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "INVALID_JSON",
                message: "无效的JSON格式",
              },
            },
            { status: 400 }
          );
        }

        // 检查是否是数据库连接错误
        if (
          (error.message &&
            error.message.includes("Error connecting to database")) ||
          (error.message && error.message.includes("fetch failed"))
        ) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "DATABASE_CONNECTION_ERROR",
                message: "数据库连接失败，请稍后再试",
              },
            },
            { status: 503 }
          );
        }

        throw new ValidationError(error.message);
      }
    };
  };
}

/**
 * 格式化Zod验证错误
 * @param {Object} error Zod错误对象
 * @returns {Object} 格式化后的错误对象
 */
function formatZodErrors(error) {
  return error.errors.reduce((acc, err) => {
    const path = err.path.join(".");
    acc[path] = err.message;
    return acc;
  }, {});
}

/**
 * 验证数据
 * @param {Object} data 要验证的数据
 * @param {Object} schema 验证模式
 * @returns {Object} 验证结果
 */
export function validateData(data, schema) {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      errors: formatZodErrors(result.error),
    };
  }
  return {
    success: true,
    data: result.data,
  };
}

/**
 * 创建验证错误响应
 * @param {Object} errors 错误对象
 * @returns {Response} 响应对象
 */
export function createValidationErrorResponse(errors) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "请求数据验证失败",
        details: errors,
      },
    },
    { status: 400 }
  );
}

/**
 * 创建服务器错误响应
 * @param {Error} error 错误对象
 * @returns {Response} 响应对象
 */
export function createServerErrorResponse(error) {
  console.error("服务器错误:", error);

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

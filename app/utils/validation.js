import { NextResponse } from "next/server";

/**
 * 使用Zod模式验证数据
 * @param {Object} data 要验证的数据
 * @param {Object} schema Zod验证模式
 * @returns {Object} 验证结果
 */
export function validateData(data, schema) {
  try {
    const result = schema.safeParse(data);
    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        errors: result.error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      };
    }
  } catch (error) {
    console.error("验证数据时发生错误:", error);
    return {
      success: false,
      errors: [
        {
          path: "unknown",
          message: "验证数据时发生错误",
        },
      ],
    };
  }
}

/**
 * 创建验证错误响应
 * @param {Array} errors 错误信息数组
 * @returns {Response} 错误响应
 */
export function createValidationErrorResponse(errors) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "数据验证失败",
        details: errors,
      },
    },
    { status: 400 }
  );
}

/**
 * 创建服务器错误响应
 * @param {Error} error 错误对象
 * @returns {Response} 错误响应
 */
export function createServerErrorResponse(error) {
  // 检查是否是自定义错误类型
  if (error.statusCode && error.errorCode) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.errorCode,
          message: error.message,
        },
      },
      { status: error.statusCode }
    );
  }

  // 默认服务器错误
  console.error("服务器错误:", error);
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "服务器内部错误",
      },
    },
    { status: 500 }
  );
}

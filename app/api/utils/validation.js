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
    console.error("验证数据时出错:", error);
    return {
      success: false,
      errors: [
        {
          path: "unknown",
          message: "验证过程中发生未知错误",
        },
      ],
    };
  }
}

/**
 * 创建验证错误响应
 * @param {Array} errors 错误信息数组
 * @returns {NextResponse} 错误响应
 */
export function createValidationErrorResponse(errors) {
  return NextResponse.json(
    {
      success: false,
      message: "验证失败",
      errors: errors,
    },
    {
      status: 400,
    }
  );
}

/**
 * 创建服务器错误响应
 * @param {Error} error 错误对象
 * @returns {NextResponse} 错误响应
 */
export function createServerErrorResponse(error) {
  console.error("服务器错误:", error);
  return NextResponse.json(
    {
      success: false,
      message: "服务器内部错误",
    },
    {
      status: 500,
    }
  );
}

/**
 * 创建成功响应
 * @param {Object} data 响应数据
 * @param {string} message 成功消息
 * @returns {NextResponse} 成功响应
 */
export function createSuccessResponse(data, message = "操作成功") {
  return NextResponse.json({
    success: true,
    message,
    data,
  });
}

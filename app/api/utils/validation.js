import { NextResponse } from "next/server";

/**
 * 格式化Zod验证错误
 * @param {Object} error Zod错误对象
 * @returns {Object} 格式化后的错误对象
 */
export function formatZodErrors(error) {
  return error.errors.reduce((acc, err) => {
    const path = err.path.join(".");
    acc[path] = err.message;
    return acc;
  }, {});
}

/**
 * 验证请求数据
 * @param {Object} data 请求数据
 * @param {Object} schema Zod验证模式
 * @returns {Object} 验证结果对象，包含success、data或errors
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
 * @param {Object} errors 错误详情
 * @returns {Response} 错误响应
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
 * @returns {Response} 错误响应
 */
export function createServerErrorResponse(error) {
  console.error("API错误:", error);
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "服务器内部错误",
      },
    },
    { status: 500 }
  );
}

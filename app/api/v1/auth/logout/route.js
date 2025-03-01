import { NextResponse } from "next/server";
import { logoutController } from "../../../controllers";
import { logoutSchema } from "../../../schemas";
import {
  validateData,
  createValidationErrorResponse,
  createServerErrorResponse,
  withAPI,
} from "../../../middleware";

/**
 * 用户登出API
 * @param {Request} request 请求对象
 * @returns {Promise<Response>} 响应对象
 */
async function handler(request) {
  try {
    // 获取请求数据
    const data = await request.json();

    // 验证数据
    const validation = validateData(data, logoutSchema);
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors);
    }

    // 调用控制器处理登出
    return await logoutController(request, validation.data);
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

// 使用API中间件包装处理函数
export const POST = withAPI(handler);

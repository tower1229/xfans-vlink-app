import { NextResponse } from "next/server";
import { registerController } from "../../../controllers";
import { registerSchema } from "../../../schemas";
import {
  validateData,
  createValidationErrorResponse,
  createServerErrorResponse,
  withAPI,
} from "../../../middleware";

/**
 * 用户注册API
 * @param {Request} request 请求对象
 * @returns {Promise<Response>} 响应对象
 */
async function handler(request) {
  try {
    // 获取请求数据
    const data = await request.json();

    // 验证数据
    const validation = validateData(data, registerSchema);
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors);
    }

    // 调用控制器处理注册
    return await registerController(request, validation.data);
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

// 使用API中间件包装处理函数
export const POST = withAPI(handler);

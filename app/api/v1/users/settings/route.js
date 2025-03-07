import { NextResponse } from "next/server";
import {
  updateUserSettingsController,
  getCurrentUserController,
} from "../../../controllers";
import { userSettingsSchema } from "../../../schemas";
import {
  validateData,
  createValidationErrorResponse,
  createServerErrorResponse,
} from "../../../utils/validation";
import { withAuthAPI } from "../../../middleware";

/**
 * 获取用户设置API
 * @param {Request} request 请求对象
 * @returns {Promise<Response>} 响应对象
 */
async function handleGET(request) {
  try {
    // 调用控制器获取当前用户信息
    // 这里复用 getCurrentUserController，但我们可以在响应中只返回设置相关的字段
    const response = await getCurrentUserController(request);

    // 解析响应
    const data = await response.json();

    // 只返回设置相关的字段
    if (data.success && data.data) {
      return NextResponse.json({
        success: true,
        data: {
          username: data.data.username,
          email: data.data.email,
          walletAddress: data.data.walletAddress,
        },
      });
    }

    return response;
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

/**
 * 更新用户设置API
 * @param {Request} request 请求对象
 * @returns {Promise<Response>} 响应对象
 */
async function handlePUT(request) {
  try {
    // 获取请求数据
    const data = await request.json();

    // 验证数据
    const validation = validateData(data, userSettingsSchema);
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors);
    }

    // 调用控制器更新用户设置
    return await updateUserSettingsController(request, validation.data);
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

// 使用身份验证中间件包装处理函数并直接导出
export const GET = withAuthAPI(handleGET);
export const PUT = withAuthAPI(handlePUT);

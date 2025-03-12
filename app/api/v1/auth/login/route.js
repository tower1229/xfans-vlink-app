import { loginController } from "../../../controllers";
import { loginSchema } from "../../../schemas";
import {
  validateData,
  createValidationErrorResponse,
  createServerErrorResponse,
  withAPI,
} from "../../../middleware";

/**
 * 用户登录API
 * @param {Request} request 请求对象
 * @returns {Promise<Response>} 响应对象
 */
async function handler(request) {
  try {
    // 获取请求数据
    const data = await request.json();

    // 验证数据
    const validation = validateData(data, loginSchema);
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors);
    }

    // 调用控制器处理登录
    return await loginController(request, validation.data);
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

// 使用API中间件包装处理函数
export const POST = withAPI(handler);

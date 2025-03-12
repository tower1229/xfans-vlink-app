import {
  getCurrentUserController,
  updateUserController,
  deleteUserController,
} from "../../../controllers";
import { updateUserSchema } from "../../../schemas";
import {
  validateData,
  createValidationErrorResponse,
  createServerErrorResponse,
  withAuthAPI,
} from "../../../middleware";

/**
 * 获取当前用户信息API
 * @param {Request} request 请求对象
 * @returns {Promise<Response>} 响应对象
 */
async function handleGET(request) {
  try {
    // 调用控制器获取当前用户信息
    return await getCurrentUserController(request);
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

/**
 * 更新当前用户信息API
 * @param {Request} request 请求对象
 * @returns {Promise<Response>} 响应对象
 */
async function handlePUT(request) {
  try {
    // 获取请求数据
    const data = await request.json();

    // 验证数据
    const validation = validateData(data, updateUserSchema);
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors);
    }

    // 调用控制器更新用户信息
    return await updateUserController(request, validation.data);
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

/**
 * 删除当前用户API
 * @param {Request} request 请求对象
 * @returns {Promise<Response>} 响应对象
 */
async function handleDELETE(request) {
  try {
    // 调用控制器删除用户
    return await deleteUserController(request);
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

// 使用身份验证中间件包装处理函数并直接导出
export const GET = withAuthAPI(handleGET);
export const PUT = withAuthAPI(handlePUT);
export const DELETE = withAuthAPI(handleDELETE);

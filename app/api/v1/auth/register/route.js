import { registerController } from "../../../controllers";
import { registerSchema } from "../../../schemas";
import { validateData } from "../../../utils/validation";
import { withAPI } from "../../../middleware";
import { ValidationError } from "../../../../_utils/errors";

/**
 * 用户注册API
 * @param {Request} request 请求对象
 * @returns {Promise<Response>} 响应对象
 */
export const POST = withAPI(async (request) => {
  // 获取请求数据
  const data = await request.json();

  // 验证数据
  const validation = validateData(data, registerSchema);
  if (!validation.success) {
    throw new ValidationError(validation.errors);
  }

  // 调用控制器处理注册
  return await registerController(request, validation.data);
});

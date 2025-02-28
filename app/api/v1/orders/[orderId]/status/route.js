import { NextResponse } from "next/server";
import { updateOrderStatusController } from "../../../../../controllers";
import { updateOrderStatusSchema } from "../../../../../schemas";
import {
  validateData,
  createValidationErrorResponse,
  createServerErrorResponse,
} from "../../../../../utils/validation";

// 更新订单状态
export async function POST(request, context) {
  try {
    // 异步获取参数
    const { orderId } = await context.params;

    // 获取请求数据
    const data = await request.json();

    // 使用通用验证工具验证数据
    const validation = validateData(data, updateOrderStatusSchema);
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors);
    }

    // 调用控制器
    return await updateOrderStatusController(request, orderId, validation.data);
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

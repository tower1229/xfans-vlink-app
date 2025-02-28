import { NextResponse } from "next/server";
import { updateOrderStatusController } from "../../../../controllers";
import { updateOrderStatusSchema } from "../../../../schemas";
import {
  validateData,
  createValidationErrorResponse,
  createServerErrorResponse,
} from "../../../../utils/validation";

// 更新订单状态
export async function PUT(request, { params }) {
  try {
    const { orderId } = params;

    // 获取请求数据
    const data = await request.json();

    // 使用通用验证工具验证数据
    const validation = validateData(data, updateOrderStatusSchema);
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors);
    }

    // 调用控制器更新订单状态
    return await updateOrderStatusController(request, orderId, validation.data);
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

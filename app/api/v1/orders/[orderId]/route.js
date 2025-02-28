import { NextResponse } from "next/server";
import { getOrderByIdController } from "../../../controllers";
import { createServerErrorResponse } from "../../../utils/validation";

// 获取订单详情
export async function GET(request, context) {
  try {
    // 异步获取参数
    const { orderId } = await context.params;

    // 调用控制器
    return await getOrderByIdController(request, orderId);
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

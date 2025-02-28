import { NextResponse } from "next/server";
import { getOrderByIdController } from "../../../controllers";
import { createServerErrorResponse } from "../../../utils/validation";

// 获取订单详情
export async function GET(request, { params }) {
  try {
    const { orderId } = params;

    // 调用控制器获取订单详情
    return await getOrderByIdController(request, orderId);
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

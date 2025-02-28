import { NextResponse } from "next/server";
import { getUserOrdersController } from "../../../../controllers";
import { createServerErrorResponse } from "../../../../utils/validation";

// 获取用户订单列表
export async function GET(request, context) {
  try {
    // 异步获取参数
    const { userAddress } = await context.params;

    // 调用控制器
    return await getUserOrdersController(request, userAddress);
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

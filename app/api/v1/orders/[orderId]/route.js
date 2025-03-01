import { NextResponse } from "next/server";
import { getOrderByIdController } from "../../../controllers";
import { createServerErrorResponse } from "../../../utils/validation";
import { withAuth } from "../../../middleware/auth";

// 获取订单详情
export async function GET(request, { params }) {
  try {
    // 使用withAuth中间件包装请求处理
    return await withAuth(request, async (authenticatedRequest) => {
      // 确保params是已解析的对象
      const resolvedParams = await Promise.resolve(params);
      const orderId = resolvedParams.orderId;

      // 调用控制器获取订单详情
      return await getOrderByIdController(authenticatedRequest, orderId);
    });
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

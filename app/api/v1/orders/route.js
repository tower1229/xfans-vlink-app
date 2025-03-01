import { NextResponse } from "next/server";
import {
  createOrderController,
  getAllOrdersController,
} from "../../controllers";
import { createOrderSchema } from "../../schemas";
import {
  validateData,
  createValidationErrorResponse,
  createServerErrorResponse,
} from "../../utils/validation";
import { withAuth } from "../../middleware/auth";

// 创建订单
export async function POST(request) {
  try {
    // 使用withAuth中间件包装请求处理
    return await withAuth(request, async (authenticatedRequest) => {
      // 获取请求数据
      const data = await request.json();

      // 使用通用验证工具验证数据
      const validation = validateData(data, createOrderSchema);
      if (!validation.success) {
        return createValidationErrorResponse(validation.errors);
      }

      // 调用控制器
      return await createOrderController(authenticatedRequest, validation.data);
    });
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

// TODO: 找不到自己的订单
// 获取所有订单
export async function GET(request) {
  try {
    // 使用withAuth中间件包装请求处理
    return await withAuth(request, async (authenticatedRequest) => {
      // 调用控制器获取所有订单
      return await getAllOrdersController(authenticatedRequest);
    });
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

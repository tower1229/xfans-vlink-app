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

// 创建订单
export async function POST(request) {
  try {
    // 获取请求数据
    const data = await request.json();

    // 使用通用验证工具验证数据
    const validation = validateData(data, createOrderSchema);
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors);
    }

    // 调用控制器
    return await createOrderController(request, validation.data);
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

// 获取所有订单
export async function GET(request) {
  try {
    // 调用控制器获取所有订单
    return await getAllOrdersController(request);
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

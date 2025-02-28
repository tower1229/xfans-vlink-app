import { NextResponse } from "next/server";
import {
  getAllProductsController,
  createProductController,
} from "../../controllers";
import { createProductSchema } from "../../schemas";
import {
  validateData,
  createValidationErrorResponse,
  createServerErrorResponse,
} from "../../utils/validation";

// 获取所有产品
export async function GET(request) {
  try {
    return await getAllProductsController(request);
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

// 创建产品
export async function POST(request) {
  try {
    // 获取请求数据
    const data = await request.json();

    // 使用通用验证工具验证数据
    const validation = validateData(data, createProductSchema);
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors);
    }

    // 调用控制器
    return await createProductController(request, validation.data);
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

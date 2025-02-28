import { NextResponse } from "next/server";
import {
  getProductByIdController,
  updateProductController,
  deleteProductController,
} from "../../../controllers";
import { updateProductSchema } from "../../../schemas";
import {
  validateData,
  createValidationErrorResponse,
  createServerErrorResponse,
} from "../../../utils/validation";

// 获取单个产品
export async function GET(request, context) {
  try {
    // 异步获取参数
    const { id } = await context.params;

    // 调用控制器并传递ID
    return await getProductByIdController(request, id);
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

// 更新产品
export async function PUT(request, context) {
  try {
    // 异步获取参数
    const { id } = await context.params;

    // 获取请求数据
    const data = await request.json();

    // 使用通用验证工具验证数据
    const validation = validateData(data, updateProductSchema);
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors);
    }

    // 调用控制器并传递ID和数据
    return await updateProductController(request, id, validation.data);
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

// 删除产品
export async function DELETE(request, context) {
  try {
    // 异步获取参数
    const { id } = await context.params;

    // 调用控制器并传递ID
    return await deleteProductController(request, id);
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

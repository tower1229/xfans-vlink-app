import { NextResponse } from "next/server";
import {
  createOrderController,
  getAllOrdersController,
  getUserOrdersController,
} from "../../controllers";
import { createOrderSchema } from "../../schemas";
import { validateData } from "../../utils/validation";
import { withAuthAPI } from "../../middleware";
import { OrderError } from "../../../utils/orderUtils";
import { createServerErrorResponse } from "../../../utils/validation";

// 创建订单
export const POST = withAuthAPI(async (request) => {
  try {
    // 获取请求数据
    const data = await request.json();

    // 验证数据
    const validation = validateData(data, createOrderSchema);
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: {
          message: "数据验证失败",
          code: "VALIDATION_ERROR",
          details: validation.errors,
        },
      });
    }

    // 调用控制器
    return await createOrderController(request, validation.data);
  } catch (error) {
    console.error("处理创建订单请求失败:", error);
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof OrderError ? error.message : "创建订单失败",
        code: error instanceof OrderError ? error.code : "INTERNAL_ERROR",
      },
    });
  }
});

// 获取订单列表
export async function GET(request) {
  try {
    // 从 URL 获取查询参数
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const status = searchParams.get("status");

    if (!userAddress) {
      return NextResponse.json(
        { error: "userAddress is required" },
        { status: 400 }
      );
    }

    // 验证分页参数
    if (isNaN(page) || page < 1 || isNaN(pageSize) || pageSize < 1) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    // 调用控制器
    return await getUserOrdersController(request, userAddress, {
      page,
      pageSize,
      status,
    });
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

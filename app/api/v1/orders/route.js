import { NextResponse } from "next/server";
import {
  createOrderController,
  getAllOrdersController,
  getUserOrdersController,
} from "../../controllers";
import { createOrderSchema } from "../../schemas";
import {
  validateData,
  createServerErrorResponse,
} from "../../utils/validation";
import { withAuthAPI } from "../../middleware";

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
        message: "创建订单失败",
        code: "INTERNAL_ERROR",
      },
    });
  }
});

// 获取订单列表
export const GET = withAuthAPI(async (request) => {
  try {
    // 从 URL 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const status = searchParams.get("status");

    // 从认证中间件中获取用户信息
    const user = request.user;

    // 验证用户信息
    if (!user || !user.userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "未授权访问",
            code: "UNAUTHORIZED",
          },
        },
        { status: 401 }
      );
    }

    // 验证分页参数
    if (isNaN(page) || page < 1 || isNaN(pageSize) || pageSize < 1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "无效的分页参数",
            code: "INVALID_PAGINATION",
          },
        },
        { status: 400 }
      );
    }

    // 根据用户角色决定返回所有订单或仅用户自己的订单
    if (user.role === "admin") {
      // 管理员可以查看所有订单
      return await getAllOrdersController(request, {
        page,
        pageSize,
        status,
      });
    } else {
      // 普通用户只能查看自己的订单
      return await getUserOrdersController(request, user.userId, {
        page,
        pageSize,
        status,
      });
    }
  } catch (error) {
    return createServerErrorResponse(error);
  }
});

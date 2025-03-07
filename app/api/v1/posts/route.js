import { NextResponse } from "next/server";
import { getAllPostsController, createPostController } from "../../controllers";
import { createPostSchema } from "../../schemas";
import {
  validateData,
  createValidationErrorResponse,
  createServerErrorResponse,
} from "../../utils/validation";
import { withAuth } from "../../middleware/auth";

// 获取所有付费内容
export async function GET(request) {
  try {
    // 使用withAuth中间件包装请求处理
    return await withAuth(request, async (authenticatedRequest) => {
      return await getAllPostsController(authenticatedRequest);
    });
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

// 创建付费内容
export async function POST(request) {
  try {
    // 使用withAuth中间件包装请求处理
    return await withAuth(request, async (authenticatedRequest) => {
      // 获取请求数据
      const data = await request.json();

      // 使用通用验证工具验证数据
      const validation = validateData(data, createPostSchema);
      if (!validation.success) {
        return createValidationErrorResponse(validation.errors);
      }

      // 调用控制器
      return await createPostController(authenticatedRequest, validation.data);
    });
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

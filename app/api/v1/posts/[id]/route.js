import {
  getPostByIdController as getPostById,
  updatePostController as updatePost,
  deletePostController as deletePost,
} from "../../../controllers/postController";
import { updatePostSchema } from "../../../schemas";
import {
  validateData,
  createValidationErrorResponse,
  createServerErrorResponse,
} from "../../../utils/validation";
import { withAuth } from "../../../middleware/auth";

// 获取单个付费内容
export async function GET(request, context) {
  try {
    // 使用withAuth中间件包装请求处理
    return await withAuth(request, async (authenticatedRequest) => {
      // 异步获取参数
      const { id } = await context.params;

      // 调用控制器并传递ID
      return await getPostById(authenticatedRequest, id);
    });
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

// 更新付费内容
export async function PUT(request, context) {
  try {
    // 使用withAuth中间件包装请求处理
    return await withAuth(request, async (authenticatedRequest) => {
      // 异步获取参数
      const { id } = await context.params;

      // 获取请求数据
      const data = await request.json();

      // 使用通用验证工具验证数据
      const validation = validateData(data, updatePostSchema);
      if (!validation.success) {
        return createValidationErrorResponse(validation.errors);
      }

      // 调用控制器并传递ID和数据
      return await updatePost(authenticatedRequest, id, validation.data);
    });
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

// 删除付费内容
export async function DELETE(request, context) {
  try {
    // 使用withAuth中间件包装请求处理
    return await withAuth(request, async (authenticatedRequest) => {
      // 异步获取参数
      const { id } = await context.params;

      // 调用控制器并传递ID
      return await deletePost(authenticatedRequest, id);
    });
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

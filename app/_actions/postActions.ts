import { fetchWithAuth } from "@/_utils/api";
import { Post, PostFormData, PostStatus } from "@/_types/post";
import { ApiResponse, APIError } from "@/_types/api";

// 参数验证函数
function validatePostData(formData: PostFormData): void {
  if (!formData.title?.trim()) {
    throw new APIError("标题不能为空", "INVALID_TITLE");
  }
  if (!formData.image?.trim()) {
    throw new APIError("图片不能为空", "INVALID_IMAGE");
  }
  if (!formData.price?.trim()) {
    throw new APIError("价格不能为空", "INVALID_PRICE");
  }
  if (!formData.tokenAddress?.trim()) {
    throw new APIError("代币地址不能为空", "INVALID_TOKEN_ADDRESS");
  }
  if (!formData.chainId) {
    throw new APIError("链ID不能为空", "INVALID_CHAIN_ID");
  }

  const chainId = Number(formData.chainId);
  if (isNaN(chainId) || chainId <= 0) {
    throw new APIError("链ID必须是有效的正整数", "INVALID_CHAIN_ID");
  }
}

// 获取所有付费内容
export async function fetchPosts(): Promise<Post[]> {
  try {
    const response = await fetchWithAuth<ApiResponse<Post[]>>("/api/v1/posts");

    if (!response.success) {
      throw new APIError(response.message || "获取付费内容失败");
    }

    return response.data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError("获取付费内容时发生错误", "FETCH_ERROR", 500);
  }
}

// 创建付费内容
export async function createPost(formData: PostFormData): Promise<Post> {
  try {
    // 验证表单数据
    validatePostData(formData);

    const chainId = Number(formData.chainId);
    const response = await fetchWithAuth<ApiResponse<Post>>("/api/v1/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        chainId,
        status: formData.status || PostStatus.DRAFT,
      }),
    });

    if (!response.success) {
      throw new APIError(response.message || "创建付费内容失败");
    }

    return response.data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError("创建付费内容时发生错误", "CREATE_ERROR", 500);
  }
}

// 更新付费内容
export async function updatePost(
  postId: string,
  formData: PostFormData
): Promise<Post> {
  try {
    if (!postId?.trim()) {
      throw new APIError("内容ID不能为空", "INVALID_POST_ID");
    }

    // 验证表单数据
    validatePostData(formData);

    const chainId = Number(formData.chainId);
    const response = await fetchWithAuth<ApiResponse<Post>>(
      `/api/v1/posts/${postId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          chainId,
        }),
      }
    );

    if (!response.success) {
      throw new APIError(response.message || "更新付费内容失败");
    }

    return response.data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError("更新付费内容时发生错误", "UPDATE_ERROR", 500);
  }
}

// 删除付费内容
export async function deletePost(postId: string): Promise<void> {
  try {
    if (!postId?.trim()) {
      throw new APIError("内容ID不能为空", "INVALID_POST_ID");
    }

    const response = await fetchWithAuth<ApiResponse<void>>(
      `/api/v1/posts/${postId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.success) {
      throw new APIError(response.message || "删除付费内容失败");
    }
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError("删除付费内容时发生错误", "DELETE_ERROR", 500);
  }
}

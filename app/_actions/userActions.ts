import { fetchWithAuth } from "@/_utils/api";
import { User, EditUser } from "@/_types/user";
import { ApiResponse, APIError } from "@/_types/api";

// 参数验证函数
function validatePostData(formData: EditUser): void {
  if (!formData.password?.trim()) {
    throw new APIError("密码不能为空", "INVALID_PASSWORD");
  }
}

// 更新用户信息
export async function updateUser(
  formData: EditUser
): Promise<ApiResponse<User>> {
  try {
    // 验证表单数据
    validatePostData(formData);

    const response = await fetchWithAuth<ApiResponse<User>>(
      `/api/v1/users/settings`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    return response;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError("更新用户信息时发生错误", "UPDATE_ERROR", 500);
  }
}

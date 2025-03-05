// Utility functions for API requests with authentication
import { logout } from "./auth";

interface ApiError {
  error?: {
    message: string;
  };
}

/**
 * 处理API错误响应
 * @param response API响应对象
 * @returns 处理后的响应数据
 */
async function handleApiError<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & ApiError;

  // 处理401未授权错误
  if (response.status === 401) {
    console.log("检测到401错误，执行登出操作");
    // 确保从 auth.ts 导入 logout
    await logout();
    throw new Error("登录已过期，请重新登录");
  }

  // 处理其他错误
  if (!response.ok) {
    throw new Error(
      data.error?.message || `HTTP error! status: ${response.status}`
    );
  }

  return data;
}

/**
 * Get the authentication headers for API requests
 * @returns Headers object with Authorization header if token exists
 */
export const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Only run in browser environment
  if (typeof window !== "undefined") {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
  }

  return headers;
};

/**
 * Make an authenticated API request
 * @param url The API endpoint URL
 * @param options Request options
 * @returns Response from the API
 */
export const fetchWithAuth = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const authHeaders = getAuthHeaders();

  // Merge the auth headers with any existing headers
  const headers = {
    ...authHeaders,
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    return await handleApiError<T>(response);
  } catch (error) {
    console.error("API请求失败:", error);
    throw error;
  }
};

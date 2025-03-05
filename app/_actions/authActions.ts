import { fetchWithAuth } from "@/_utils/api";

export interface User {
  id: string;
  username: string;
  email: string;
  [key: string]: any;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
  };
}

export async function fetchUserInfo(): Promise<ApiResponse<User>> {
  const response = (await fetchWithAuth("/api/v1/users/me")) as Response;
  const data = (await response.json()) as ApiResponse<User>;

  if (!data.success) {
    throw new Error(data.error?.message || "获取用户信息失败");
  }

  return data;
}

export async function login(
  username: string,
  password: string
): Promise<
  ApiResponse<{
    user: User;
    tokens: { accessToken: string; refreshToken: string };
  }>
> {
  const response = (await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })) as Response;
  return response.json();
}

export async function logout(refreshToken: string): Promise<void> {
  await fetchWithAuth("/api/v1/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export async function refreshToken(
  token: string
): Promise<ApiResponse<{ accessToken: string }>> {
  const response = (await fetch("/api/v1/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: token }),
  })) as Response;
  return response.json();
}

export async function register(
  username: string,
  walletAddress: string,
  password: string
): Promise<ApiResponse<void>> {
  const response = (await fetch("/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, walletAddress, password }),
  })) as Response;
  return response.json();
}

export default { fetchUserInfo };

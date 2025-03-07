import { fetchWithAuth } from "@/_utils/api";
import { User } from "@/_types/user";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
  };
}

export async function fetchUserInfo(): Promise<ApiResponse<User>> {
  const response = await fetchWithAuth<ApiResponse<User>>("/api/v1/users/me");

  if (response.error) {
    throw new Error(response.error?.message || "获取用户信息失败");
  }

  return response;
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

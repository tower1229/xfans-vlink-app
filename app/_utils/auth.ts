/**
 * 登出操作
 * @returns {Promise<void>}
 */
export async function logout(): Promise<void> {
  try {
    // 清除本地存储的令牌
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // 清除其他可能存在的用户相关数据
    localStorage.removeItem("user");

    // 重定向到登录页面
    window.location.href = "/login";
  } catch (error) {
    console.error("登出失败:", error);
  }
}

/**
 * 获取访问令牌
 * @returns {string|null} 访问令牌
 */
export function getAccessToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
}

/**
 * 获取刷新令牌
 * @returns {string|null} 刷新令牌
 */
export function getRefreshToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refreshToken");
  }
  return null;
}

/**
 * 保存令牌
 * @param {string} accessToken 访问令牌
 * @param {string} refreshToken 刷新令牌
 */
export function saveTokens(accessToken: string, refreshToken: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }
}

/**
 * 检查是否已登录
 * @returns {boolean} 是否已登录
 */
export function isAuthenticated(): boolean {
  if (typeof window !== "undefined") {
    return !!getAccessToken() && !!getRefreshToken();
  }
  return false;
}

/**
 * 获取认证头
 * @returns {Object} 认证头
 */
export function getAuthHeader(): { Authorization?: string } {
  const accessToken = getAccessToken();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

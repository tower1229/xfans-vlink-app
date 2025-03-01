import { cleanupExpiredRefreshTokens } from "@/utils";

// 清理间隔（毫秒）- 默认每天清理一次
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000;

let cleanupInterval = null;

/**
 * 启动定期清理过期令牌的任务
 */
export function startTokenCleanup() {
  if (cleanupInterval) {
    return;
  }

  // 立即执行一次清理
  cleanupExpiredRefreshTokens().catch((err) => {
    console.error("清理过期令牌失败:", err);
  });

  // 设置定期清理
  cleanupInterval = setInterval(() => {
    cleanupExpiredRefreshTokens().catch((err) => {
      console.error("清理过期令牌失败:", err);
    });
  }, CLEANUP_INTERVAL);

  console.log("已启动定期清理过期令牌的任务");
}

/**
 * 停止定期清理过期令牌的任务
 */
export function stopTokenCleanup() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log("已停止定期清理过期令牌的任务");
  }
}

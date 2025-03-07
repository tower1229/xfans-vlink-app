import { startTokenCleanup } from "./tokenCleanup";

// 标记是否已初始化
let isInitialized = false;

/**
 * 初始化服务器端功能
 */
export function initServer() {
  // 确保只初始化一次
  if (isInitialized) {
    return;
  }

  // 检查是否在服务器端
  if (typeof window === "undefined") {
    console.log("正在初始化服务器端功能...");

    // 启动令牌清理任务
    startTokenCleanup();

    // 标记为已初始化
    isInitialized = true;

    console.log("服务器端功能初始化完成");
  }
}

// 自动执行初始化
initServer();

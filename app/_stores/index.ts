"use client";

import userStore from "./userStore";

// 导出所有 store
export { userStore };

// 创建一个 RootStore 用于将来可能的扩展
export const rootStore = {
  userStore,
};

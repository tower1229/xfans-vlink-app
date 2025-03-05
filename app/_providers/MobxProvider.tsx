"use client";

import { ReactNode, useEffect } from "react";
import { userStore } from "../_stores";

interface MobxProviderProps {
  children: ReactNode;
}

export default function MobxProvider({ children }: MobxProviderProps) {
  // 在客户端初始化 MobX store
  useEffect(() => {
    // 只在客户端环境下初始化
    if (typeof window !== "undefined") {
      // 如果用户已登录（有 token）且 store 未初始化，初始化用户信息
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken && !userStore.initialized) {
        console.log("MobxProvider: Initializing user store");
        userStore.initUser();
      }
    }
  }, []);

  return <>{children}</>;
}

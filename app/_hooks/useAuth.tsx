"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "../_utils/api";
import { userStore } from "../_stores";
import { observer } from "mobx-react-lite";

// 定义用户类型
interface User {
  id: number;
  username: string;
  email?: string;
  walletAddress?: string;
  role: string;
  userId?: string;
}

// 定义认证上下文类型
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isUserInfoLoaded: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  register: (
    username: string,
    walletAddress: string,
    password: string
  ) => Promise<boolean>;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 检查是否在客户端
const isClient = typeof window !== "undefined";

// 安全地获取localStorage项
const getLocalStorageItem = (key: string): string | null => {
  if (!isClient) return null;
  return localStorage.getItem(key);
};

// 安全地设置localStorage项
const setLocalStorageItem = (key: string, value: string): void => {
  if (!isClient) return;
  localStorage.setItem(key, value);
};

// 安全地移除localStorage项
const removeLocalStorageItem = (key: string): void => {
  if (!isClient) return;
  localStorage.removeItem(key);
};

// 认证提供者组件
export const AuthProvider = observer(
  ({ children }: { children: ReactNode }) => {
    const [loading, setLoading] = useState(true);
    const [isUserInfoLoaded, setIsUserInfoLoaded] = useState(false);
    const router = useRouter();

    // 初始化认证状态
    useEffect(() => {
      const initAuth = async () => {
        // 如果用户信息已经在 MobX store 中初始化过，直接返回
        if (userStore.initialized) {
          setIsUserInfoLoaded(true);
          setLoading(false);
          return;
        }

        // 如果 MobX store 正在加载中，等待其完成
        if (userStore.loading) {
          // 等待 store 初始化完成
          const checkInterval = setInterval(() => {
            if (userStore.initialized || !userStore.loading) {
              setIsUserInfoLoaded(true);
              setLoading(false);
              clearInterval(checkInterval);
            }
          }, 100);

          // 清理函数
          return () => clearInterval(checkInterval);
        }

        setLoading(true);

        try {
          console.log("AuthProvider: Initializing user store");
          // 使用 MobX store 初始化用户信息
          await userStore.initUser();
          setIsUserInfoLoaded(true);
        } catch (error) {
          console.error("初始化认证状态失败:", error);
        } finally {
          setLoading(false);
        }
      };

      // 确保只在客户端执行
      if (isClient) {
        initAuth();
      } else {
        setLoading(false);
      }
    }, []);

    // 登录函数
    const login = async (
      username: string,
      password: string
    ): Promise<boolean> => {
      try {
        const response = await fetch("/api/v1/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "登录失败");
        }

        const data = await response.json();

        // 保存令牌到本地存储
        setLocalStorageItem("accessToken", data.data.tokens.accessToken);
        setLocalStorageItem("refreshToken", data.data.tokens.refreshToken);

        // 使用 MobX store 设置用户信息
        userStore.setUser(data.data.user);
        console.log("Login: User set in store");

        // 标记用户信息已加载
        setIsUserInfoLoaded(true);

        return true;
      } catch (error) {
        console.error("登录失败:", error);
        return false;
      }
    };

    // 登出函数
    const logout = async (): Promise<void> => {
      try {
        const refreshToken = getLocalStorageItem("refreshToken");

        if (refreshToken) {
          await fetch("/api/v1/auth/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          });
        }
      } catch (error) {
        console.error("登出失败:", error);
      } finally {
        // 使用 MobX store 清除用户信息
        userStore.logout();
        console.log("Logout: User cleared from store");

        // 重置用户信息加载状态
        setIsUserInfoLoaded(false);

        // 重定向到登录页面
        router.push("/login");
      }
    };

    // 刷新令牌函数
    const refreshToken = async (): Promise<boolean> => {
      try {
        const refreshToken = getLocalStorageItem("refreshToken");
        if (!refreshToken) {
          return false;
        }

        const response = await fetch("/api/v1/auth/refresh-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          return false;
        }

        const data = await response.json();

        // 更新访问令牌
        setLocalStorageItem("accessToken", data.data.accessToken);
        return true;
      } catch (error) {
        console.error("刷新令牌失败:", error);
        return false;
      }
    };

    // 注册函数
    const register = async (
      username: string,
      walletAddress: string,
      password: string
    ): Promise<boolean> => {
      try {
        const response = await fetch("/api/v1/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, walletAddress, password }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "注册失败");
        }

        return true;
      } catch (error) {
        console.error("注册失败:", error);
        return false;
      }
    };

    // 提供认证上下文
    return (
      <AuthContext.Provider
        value={{
          user: userStore.user,
          loading,
          isUserInfoLoaded,
          login,
          logout,
          refreshToken,
          register,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
);

// 使用认证上下文的钩子
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

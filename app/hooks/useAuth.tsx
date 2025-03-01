"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "../utils/api";

// 定义用户类型
interface User {
    id: number;
    username: string;
    email?: string;
    walletAddress?: string;
    role: string;
}

// 定义认证上下文类型
interface AuthContextType {
    user: User | null;
    loading: boolean;
    isUserInfoLoaded: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<boolean>;
    register: (username: string, walletAddress: string, password: string) => Promise<boolean>;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 检查是否在客户端
const isClient = typeof window !== 'undefined';

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
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUserInfoLoaded, setIsUserInfoLoaded] = useState(false);
    const router = useRouter();

    // 初始化认证状态
    useEffect(() => {
        const initAuth = async () => {
            // 如果用户信息已经加载过，直接返回
            if (isUserInfoLoaded) {
                setLoading(false);
                return;
            }

            // 创建AbortController用于取消请求
            const controller = new AbortController();
            const signal = controller.signal;

            try {
                // 检查本地存储中是否有访问令牌
                const accessToken = getLocalStorageItem("accessToken");
                if (!accessToken) {
                    setLoading(false);
                    setIsUserInfoLoaded(true);
                    return;
                }

                // 获取当前用户信息
                const response = await fetch("/api/v1/users/me", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    signal: signal
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.data);
                    setIsUserInfoLoaded(true);
                } else {
                    // 如果访问令牌无效，尝试刷新令牌
                    const refreshed = await refreshToken();
                    if (refreshed) {
                        // 刷新令牌成功，尝试再次获取用户信息
                        const newAccessToken = getLocalStorageItem("accessToken");
                        if (newAccessToken) {
                            const newResponse = await fetch("/api/v1/users/me", {
                                headers: {
                                    Authorization: `Bearer ${newAccessToken}`,
                                },
                                signal: signal
                            });

                            if (newResponse.ok) {
                                const newData = await newResponse.json();
                                setUser(newData.data);
                                setIsUserInfoLoaded(true);
                            }
                        }
                    } else {
                        // 如果刷新令牌也失败，清除所有令牌
                        removeLocalStorageItem("accessToken");
                        removeLocalStorageItem("refreshToken");
                        setUser(null);
                        setIsUserInfoLoaded(true);
                    }
                }
            } catch (error: any) {
                console.error("初始化认证状态失败:", error);

                // 区分请求取消和其他错误
                if (error.name !== 'AbortError') {
                    // 只有在非请求取消的错误情况下才清除令牌和用户状态
                    removeLocalStorageItem("accessToken");
                    removeLocalStorageItem("refreshToken");
                    setUser(null);
                    setIsUserInfoLoaded(true);
                } else {
                    console.log("请求被取消，保持当前用户状态");
                }
            } finally {
                setLoading(false);
            }

            // 组件卸载时取消请求
            return () => {
                controller.abort();
            };
        };

        // 确保只在客户端执行
        if (isClient) {
            initAuth();
        } else {
            setLoading(false);
        }
    }, [isUserInfoLoaded]);

    // 登录函数
    const login = async (username: string, password: string): Promise<boolean> => {
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

            // 设置用户信息
            setUser(data.data.user);

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
            // 清除本地存储和状态
            removeLocalStorageItem("accessToken");
            removeLocalStorageItem("refreshToken");
            setUser(null);

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

            // 更新本地存储中的令牌
            setLocalStorageItem("accessToken", data.data.tokens.accessToken);
            setLocalStorageItem("refreshToken", data.data.tokens.refreshToken);

            // 更新用户状态
            if (data.data.user) {
                setUser(data.data.user);
                // 标记用户信息已加载
                setIsUserInfoLoaded(true);
            }

            return true;
        } catch (error) {
            console.error("刷新令牌失败:", error);
            return false;
        }
    };

    // 注册函数
    const register = async (username: string, walletAddress: string, password: string): Promise<boolean> => {
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

            const data = await response.json();

            // 保存令牌到本地存储
            setLocalStorageItem("accessToken", data.data.tokens.accessToken);
            setLocalStorageItem("refreshToken", data.data.tokens.refreshToken);

            // 设置用户信息
            setUser(data.data.user);

            // 标记用户信息已加载
            setIsUserInfoLoaded(true);

            return true;
        } catch (error) {
            console.error("注册失败:", error);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, isUserInfoLoaded, login, logout, refreshToken, register }}>
            {children}
        </AuthContext.Provider>
    );
}

// 认证钩子
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
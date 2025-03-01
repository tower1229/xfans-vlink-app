"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

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
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<boolean>;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者组件
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // 初始化认证状态
    useEffect(() => {
        const initAuth = async () => {
            try {
                // 检查本地存储中是否有访问令牌
                const accessToken = localStorage.getItem("accessToken");
                if (!accessToken) {
                    setLoading(false);
                    return;
                }

                // 获取当前用户信息
                const response = await fetch("/api/v1/users/me", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.data);
                } else {
                    // 如果访问令牌无效，尝试刷新令牌
                    const refreshed = await refreshToken();
                    if (!refreshed) {
                        // 如果刷新令牌也失败，清除所有令牌
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("refreshToken");
                    }
                }
            } catch (error) {
                console.error("初始化认证状态失败:", error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

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
            localStorage.setItem("accessToken", data.data.tokens.accessToken);
            localStorage.setItem("refreshToken", data.data.tokens.refreshToken);

            // 设置用户信息
            setUser(data.data.user);

            return true;
        } catch (error) {
            console.error("登录失败:", error);
            return false;
        }
    };

    // 登出函数
    const logout = async (): Promise<void> => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");

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
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            setUser(null);

            // 重定向到登录页面
            router.push("/login");
        }
    };

    // 刷新令牌函数
    const refreshToken = async (): Promise<boolean> => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
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
            localStorage.setItem("accessToken", data.data.tokens.accessToken);
            localStorage.setItem("refreshToken", data.data.tokens.refreshToken);

            return true;
        } catch (error) {
            console.error("刷新令牌失败:", error);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshToken }}>
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
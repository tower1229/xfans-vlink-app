"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
    children: React.ReactNode;
    adminOnly?: boolean;
}

export default function ProtectedRoute({
    children,
    adminOnly = false,
}: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            // 如果用户未登录，重定向到登录页面
            if (!user) {
                router.push("/login");
            }
            // 如果需要管理员权限但用户不是管理员，重定向到首页
            else if (adminOnly && user.role !== "admin") {
                router.push("/");
            }
        }
    }, [user, loading, router, adminOnly]);

    // 如果正在加载，显示加载状态
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // 如果用户未登录或需要管理员权限但用户不是管理员，不渲染子组件
    if (!user || (adminOnly && user.role !== "admin")) {
        return null;
    }

    // 渲染子组件
    return <>{children}</>;
}
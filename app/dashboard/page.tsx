"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../dashboard-layout";
import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
    const router = useRouter();
    const { user, loading } = useAuth();

    // 如果用户未登录且加载完成，重定向到登录页面
    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // 如果正在加载或用户未登录，显示加载状态
    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">欢迎回来，{user.username}</h1>
                    <p className="text-gray-600">这是您的个人仪表板，您可以在这里管理您的内容和查看统计数据。</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium text-gray-700">内容统计</h2>
                            <span className="text-purple-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-gray-800 mb-2">0</div>
                        <p className="text-sm text-gray-500">已发布的内容</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium text-gray-700">粉丝数量</h2>
                            <span className="text-purple-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-gray-800 mb-2">0</div>
                        <p className="text-sm text-gray-500">关注您的粉丝</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium text-gray-700">收入</h2>
                            <span className="text-purple-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-gray-800 mb-2">0 ETH</div>
                        <p className="text-sm text-gray-500">总收入</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-xs mb-8">
                    <h2 className="text-lg font-medium text-gray-700 mb-4">快速操作</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">创建内容</span>
                        </button>
                        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">查看统计</span>
                        </button>
                        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">管理粉丝</span>
                        </button>
                        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">账户设置</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-xs">
                    <h2 className="text-lg font-medium text-gray-700 mb-4">钱包信息</h2>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center mb-2">
                            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">钱包地址</span>
                        </div>
                        <div className="bg-white p-3 rounded-sm border border-gray-200">
                            <p className="text-sm font-mono text-gray-600 break-all">{user.walletAddress || '未设置钱包地址'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
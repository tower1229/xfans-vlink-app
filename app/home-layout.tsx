"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./hooks/useAuth";

interface HomeLayoutProps {
    children: React.ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
    const pathname = usePathname();
    const { user, loading, logout } = useAuth();

    const navItems = [
        { name: "首页", path: "/" },
        { name: "探索", path: "/explore" },
        { name: "创作者", path: "/creators" },
        { name: "关于", path: "/about" },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-pink-50">
            {/* 导航栏 */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                                X-Fans
                            </div>
                        </div>

                        <nav className="hidden md:flex items-center space-x-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`text-gray-700 hover:text-purple-600 transition-colors ${pathname === item.path
                                        ? "font-medium text-purple-600 border-b-2 border-purple-600"
                                        : ""
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center space-x-4">
                            {loading ? (
                                // 加载状态显示加载指示器
                                <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin"></div>
                            ) : user ? (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        href="/dashboard"
                                        className="px-4 py-2 rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                                    >
                                        我的主页
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="text-gray-600 hover:text-gray-800"
                                    >
                                        退出
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        href="/login"
                                        className="text-gray-700 hover:text-purple-600 transition-colors"
                                    >
                                        登录
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-colors"
                                    >
                                        注册
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* 主要内容 */}
            <main className="flex-grow">
                {children}
            </main>

            {/* 页脚 */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">X-Fans</h3>
                            <p className="text-gray-400">
                                使用Vilink协议接入web3支付的内容创作平台，让创作者与粉丝建立更紧密的联系。
                            </p>
                        </div>
                        <div>
                            <h4 className="text-lg font-medium mb-4">平台</h4>
                            <ul className="space-y-2">
                                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">关于我们</Link></li>
                                <li><Link href="/careers" className="text-gray-400 hover:text-white transition-colors">加入我们</Link></li>
                                <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">博客</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-medium mb-4">支持</h4>
                            <ul className="space-y-2">
                                <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">帮助中心</Link></li>
                                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">服务条款</Link></li>
                                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">隐私政策</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-medium mb-4">联系我们</h4>
                            <ul className="space-y-2">
                                <li className="text-gray-400">邮箱: contact@x-fans.com</li>
                                <li className="text-gray-400">地址: 中国上海市</li>
                            </ul>
                            <div className="flex space-x-4 mt-4">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <span className="sr-only">Twitter</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <span className="sr-only">GitHub</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
                        <p>© 2024 X-Fans. 保留所有权利。</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
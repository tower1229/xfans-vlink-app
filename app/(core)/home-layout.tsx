"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/_hooks/useAuth";
import { BellIcon, UserCircleIcon } from "@heroicons/react/24/outline";

interface HomeLayoutProps {
  children: React.ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const navItems = [
    { name: "首页", path: "/" },
    { name: "探索", path: "/" },
    { name: "创作者", path: "/" },
    { name: "关于", path: "/" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* 导航栏 */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  X-Fans
                </span>
              </Link>
            </div>

            <nav className="hidden lg:flex">
              <ul className="flex space-x-4">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={`px-3 py-2 rounded-lg ${
                        pathname === item.path
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center">
              {loading ? (
                <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <button className="p-2 rounded-full hover:bg-gray-100 relative">
                    <BellIcon className="h-5 w-5 text-gray-600" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-blue-600 rounded-full"></span>
                  </button>
                  <div className="relative">
                    <button
                      className="flex items-center"
                      onClick={() =>
                        document
                          .getElementById("userMenu")
                          ?.classList.toggle("hidden")
                      }
                    >
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <img
                          src={user.avatar || "/placeholder-avatar.jpg"}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </button>
                    <div
                      id="userMenu"
                      className="hidden absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg py-2"
                    >
                      <Link
                        href="/dashboard"
                        className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        我的主页
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          New
                        </span>
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        账户设置
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        退出登录
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    登录
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
      <main className="flex-1">{children}</main>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  X-Fans
                </span>
              </h3>
              <p className="text-gray-400">
                使用Vilink协议接入web3支付的内容创作平台，让创作者与粉丝建立更紧密的联系。
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">平台</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-gray-400 hover:text-white"
                  >
                    关于我们
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-gray-400 hover:text-white"
                  >
                    加入我们
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-white">
                    博客
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">支持</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/help" className="text-gray-400 hover:text-white">
                    帮助中心
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-400 hover:text-white"
                  >
                    服务条款
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-400 hover:text-white"
                  >
                    隐私政策
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">联系我们</h4>
              <ul className="space-y-2">
                <li className="text-gray-400">邮箱: contact@x-fans.com</li>
                <li className="text-gray-400">地址: 中国上海市</li>
              </ul>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="p-2 rounded-full hover:bg-gray-800">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="p-2 rounded-full hover:bg-gray-800">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
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

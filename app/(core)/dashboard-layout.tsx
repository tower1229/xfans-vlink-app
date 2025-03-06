"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/_hooks/useAuth";
import ProtectedRoute from "@/_components/auth/ProtectedRoute";
import {
  HomeIcon,
  DocumentTextIcon,
  UsersIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ChartBarIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const navItems = [
    {
      name: "仪表板",
      path: "/dashboard",
      icon: HomeIcon,
    },
    {
      name: "内容管理",
      path: "/posts",
      icon: DocumentTextIcon,
    },
    {
      name: "粉丝管理",
      path: "/fans",
      icon: UsersIcon,
    },
    {
      name: "订单记录",
      path: "/orders",
      icon: CreditCardIcon,
    },
    {
      name: "数据统计",
      path: "/analytics",
      icon: ChartBarIcon,
    },
    {
      name: "账户设置",
      path: "/settings",
      icon: Cog6ToothIcon,
    },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-base-200">
        {/* 顶部导航栏 */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg dark:bg-gray-800">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-xl font-bold">
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  X-Fans
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-150 dark:text-gray-300 dark:hover:bg-gray-700">
                <div className="relative">
                  <BellIcon className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-500"></span>
                </div>
              </button>
              <div className="relative">
                <button
                  onClick={() =>
                    document
                      .getElementById("user-menu")
                      ?.classList.toggle("hidden")
                  }
                  className="flex items-center"
                >
                  <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-gray-200">
                    <img
                      src={user?.avatar || "/placeholder-avatar.jpg"}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </button>
                <div
                  id="user-menu"
                  className="hidden absolute right-0 mt-2 w-52 rounded-lg bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800"
                >
                  <Link
                    href="/profile"
                    className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    个人主页
                    <span className="ml-2 rounded bg-blue-500 px-2 py-0.5 text-xs text-white">
                      New
                    </span>
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    账户设置
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    退出登录
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="pt-16 flex">
          {/* 侧边栏 */}
          <aside className="fixed left-0 z-40">
            <div className="h-screen w-64 bg-white shadow-lg overflow-y-auto dark:bg-gray-800">
              <div className="p-4">
                {user && (
                  <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.username}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.role}
                    </p>
                  </div>
                )}
              </div>
              <nav className="px-4">
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <li key={item.path}>
                        <Link
                          href={item.path}
                          className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-150 ${
                            isActive
                              ? "bg-blue-500 text-white font-medium"
                              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          }`}
                        >
                          <item.icon className="h-5 w-5 mr-3" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              <div className="absolute bottom-0 w-full p-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
                  退出登录
                </button>
              </div>
            </div>
          </aside>

          {/* 主内容区 */}
          <main className="flex-1 ml-64">
            <div className="container mx-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {navItems.find((item) => item.path === pathname)?.name ||
                    "仪表板"}
                </h2>
                <Link
                  href="/"
                  className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-2" />
                  返回首页
                </Link>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

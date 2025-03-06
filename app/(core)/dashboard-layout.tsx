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
        <header className="navbar bg-base-100 shadow-lg fixed top-0 z-50">
          <div className="flex-1">
            <Link href="/" className="btn btn-ghost normal-case text-xl">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold">
                X-Fans
              </span>
            </Link>
          </div>
          <div className="flex-none gap-2">
            <button className="btn btn-ghost btn-circle">
              <div className="indicator">
                <BellIcon className="h-5 w-5" />
                <span className="badge badge-xs badge-primary indicator-item"></span>
              </div>
            </button>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img
                    src={user?.avatar || "/placeholder-avatar.jpg"}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </label>
              <ul
                tabIndex={0}
                className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
              >
                <li>
                  <Link href="/profile" className="justify-between">
                    个人主页
                    <span className="badge badge-primary badge-sm">New</span>
                  </Link>
                </li>
                <li>
                  <Link href="/settings">账户设置</Link>
                </li>
                <li>
                  <button onClick={handleLogout}>退出登录</button>
                </li>
              </ul>
            </div>
          </div>
        </header>

        <div className="pt-16 flex">
          {/* 侧边栏 */}
          <aside className="fixed left-0 z-40">
            <div className="h-screen w-64 bg-base-100 shadow-lg overflow-y-auto">
              <div className="p-4">
                {user && (
                  <div className="p-4 bg-base-200 rounded-lg">
                    <p className="font-medium text-base-content">
                      {user.username}
                    </p>
                    <p className="text-sm text-base-content/70">{user.role}</p>
                  </div>
                )}
              </div>
              <nav className="px-4">
                <ul className="menu menu-md gap-2">
                  {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <li key={item.path}>
                        <Link
                          href={item.path}
                          className={`flex items-center gap-3 ${
                            isActive
                              ? "bg-primary text-primary-content font-medium"
                              : "hover:bg-base-200"
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
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
                  className="btn btn-ghost w-full justify-start gap-3"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                  退出登录
                </button>
              </div>
            </div>
          </aside>

          {/* 主内容区 */}
          <main className="flex-1 ml-64">
            <div className="container mx-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-base-content">
                  {navItems.find((item) => item.path === pathname)?.name ||
                    "仪表板"}
                </h2>
                <Link href="/" className="btn btn-ghost btn-sm gap-2">
                  <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                  返回首页
                </Link>
              </div>
              <div className="bg-base-100 rounded-box shadow-lg p-6">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

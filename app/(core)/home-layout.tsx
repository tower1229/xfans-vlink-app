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
    { name: "探索", path: "/explore" },
    { name: "创作者", path: "/creators" },
    { name: "关于", path: "/about" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-base-200 to-base-100">
      {/* 导航栏 */}
      <header className="bg-base-100/80 backdrop-blur-md sticky top-0 z-50 border-b border-base-200">
        <div className="container mx-auto px-4">
          <div className="navbar min-h-16">
            <div className="navbar-start">
              <Link href="/" className="btn btn-ghost normal-case text-2xl">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold">
                  X-Fans
                </span>
              </Link>
            </div>

            <nav className="navbar-center hidden lg:flex">
              <ul className="menu menu-horizontal px-1 gap-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={`rounded-lg ${
                        pathname === item.path
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-base-200"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="navbar-end">
              {loading ? (
                <span className="loading loading-spinner loading-md text-primary"></span>
              ) : user ? (
                <div className="flex items-center gap-2">
                  <button className="btn btn-ghost btn-circle">
                    <div className="indicator">
                      <BellIcon className="h-5 w-5" />
                      <span className="badge badge-xs badge-primary indicator-item"></span>
                    </div>
                  </button>
                  <div className="dropdown dropdown-end">
                    <label
                      tabIndex={0}
                      className="btn btn-ghost btn-circle avatar"
                    >
                      <div className="w-10 rounded-full">
                        <img
                          src={user.avatar || "/placeholder-avatar.jpg"}
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
                        <Link href="/dashboard" className="justify-between">
                          我的主页
                          <span className="badge badge-primary badge-sm">
                            New
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/settings">账户设置</Link>
                      </li>
                      <li>
                        <button onClick={logout}>退出登录</button>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login" className="btn btn-ghost">
                    登录
                  </Link>
                  <Link href="/signup" className="btn btn-primary">
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
      <footer className="bg-neutral text-neutral-content">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  X-Fans
                </span>
              </h3>
              <p className="text-neutral-content/70">
                使用Vilink协议接入web3支付的内容创作平台，让创作者与粉丝建立更紧密的联系。
              </p>
            </div>
            <div>
              <h4 className="footer-title">平台</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="link link-hover">
                    关于我们
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="link link-hover">
                    加入我们
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="link link-hover">
                    博客
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="footer-title">支持</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/help" className="link link-hover">
                    帮助中心
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="link link-hover">
                    服务条款
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="link link-hover">
                    隐私政策
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="footer-title">联系我们</h4>
              <ul className="space-y-2">
                <li className="text-neutral-content/70">
                  邮箱: contact@x-fans.com
                </li>
                <li className="text-neutral-content/70">地址: 中国上海市</li>
              </ul>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="btn btn-circle btn-ghost">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="btn btn-circle btn-ghost">
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
          <div className="mt-8 pt-8 border-t border-neutral-focus text-center text-neutral-content/70">
            <p>© 2024 X-Fans. 保留所有权利。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

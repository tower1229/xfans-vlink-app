"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../_hooks/useAuth";

export default function Login() {
  const router = useRouter();
  const { user, login, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 如果用户已登录，直接重定向到仪表板
  useEffect(() => {
    if (user && !authLoading) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 简单验证
    if (!formData.username || !formData.password) {
      setError("请输入用户名和密码");
      setLoading(false);
      return;
    }

    try {
      // 调用登录API
      const success = await login(formData.username, formData.password);

      if (success) {
        // 登录成功，跳转到仪表板页面
        router.push("/dashboard");
      } else {
        setError("登录失败，请检查用户名和密码");
      }
    } catch (err: any) {
      setError(err.message || "登录时发生错误");
    } finally {
      setLoading(false);
    }
  };

  // 如果认证状态正在加载，显示加载指示器
  if (authLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center">
        <div className="border-t-transparent rounded-full border-4 border-blue-600 h-16 animate-spin w-16"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center">
      <div className="bg-white rounded-lg max-w-md shadow-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="font-bold text-3xl text-gray-800">XFans Admin</h1>
          <p className="mt-2 text-gray-600">登录您的账户</p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 mb-4 p-3 text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="font-medium text-sm mb-1 text-gray-700 block"
            >
              用户名
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className="border rounded-md border-gray-300 w-full py-2 px-3 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              placeholder="输入您的用户名"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="font-medium text-sm mb-1 text-gray-700 block"
            >
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="border rounded-md border-gray-300 w-full py-2 px-3 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              placeholder="输入您的密码"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            还没有账户？{" "}
            <Link href="/signup" className="text-blue-600 hover:text-blue-800">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

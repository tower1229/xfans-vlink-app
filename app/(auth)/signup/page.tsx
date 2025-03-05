"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../_hooks/useAuth";

export default function Signup() {
  const router = useRouter();
  const { user, register, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    walletAddress: "",
    password: "",
    confirmPassword: "",
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

    // 表单验证
    if (
      !formData.username ||
      !formData.walletAddress ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("请填写所有必填字段");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("两次输入的密码不一致");
      setLoading(false);
      return;
    }

    // 简单的钱包地址格式验证（以太坊地址格式）
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!walletRegex.test(formData.walletAddress)) {
      setError(
        "请输入有效的钱包地址（以太坊格式：0x开头，后跟40个十六进制字符）"
      );
      setLoading(false);
      return;
    }

    try {
      // 调用注册API
      const success = await register(
        formData.username,
        formData.walletAddress,
        formData.password
      );

      if (success) {
        // 注册成功，跳转到仪表板页面
        router.push("/dashboard");
      } else {
        setError("注册失败，请稍后再试");
      }
    } catch (err: any) {
      setError(err.message || "注册时发生错误");
    } finally {
      setLoading(false);
    }
  };

  // 如果认证状态正在加载，显示加载指示器
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 to-pink-50">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
            X-Fans
          </h1>
          <p className="text-gray-600 mt-2">创建您的账户</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              用户名
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              placeholder="输入您的用户名"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="walletAddress"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              钱包地址
            </label>
            <input
              id="walletAddress"
              name="walletAddress"
              type="text"
              value={formData.walletAddress}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              placeholder="输入您的以太坊钱包地址（0x开头）"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              用于接收通过Vilink协议的Web3支付
            </p>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              placeholder="输入您的密码"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              确认密码
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              placeholder="再次输入您的密码"
              disabled={loading}
            />
          </div>

          <div>
            <button
              type="submit"
              className={`w-full bg-linear-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-md hover:from-purple-700 hover:to-pink-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "注册中..." : "注册"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            已有账户？{" "}
            <Link
              href="/login"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              登录
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            注册即表示您同意我们的{" "}
            <Link
              href="/terms"
              className="text-purple-600 hover:text-purple-700"
            >
              服务条款
            </Link>{" "}
            和{" "}
            <Link
              href="/privacy"
              className="text-purple-600 hover:text-purple-700"
            >
              隐私政策
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

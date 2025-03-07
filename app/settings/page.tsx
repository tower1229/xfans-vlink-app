"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/_hooks/useAuth";
import { userStore } from "@/_stores";
import { observer } from "mobx-react-lite";
import { updateUser } from "@/_actions/userActions";

const SettingsPage = observer(() => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // 表单状态
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    walletAddress: "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });

  // 加载用户设置
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        walletAddress: user.walletAddress || "",
        currentPassword: "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  // 处理表单输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    // 验证密码确认
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("新密码和确认密码不匹配");
      setLoading(false);
      return;
    }

    try {
      // 准备要发送的数据
      const dataToSend: any = {};

      // 只包含已更改的字段
      if (formData.username && formData.username !== user?.username) {
        dataToSend.username = formData.username;
      }

      if (formData.email && formData.email !== user?.email) {
        dataToSend.email = formData.email;
      }

      if (
        formData.walletAddress &&
        formData.walletAddress !== user?.walletAddress
      ) {
        dataToSend.walletAddress = formData.walletAddress;
      }

      // 如果要更改密码
      if (formData.password && formData.currentPassword) {
        dataToSend.password = formData.password;
        dataToSend.currentPassword = formData.currentPassword;
      }

      // 如果没有要更新的数据
      if (Object.keys(dataToSend).length === 0) {
        setError("没有要更新的信息");
        setLoading(false);
        return;
      }

      // 发送请求
      const result = await updateUser(dataToSend);

      if (result.success) {
        // 更新 MobX store 中的用户信息
        userStore.updateUser(result.data);

        setSuccess(true);
        // 清除密码字段
        setFormData({
          ...formData,
          currentPassword: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        setError(result?.message || "更新设置失败");
      }
    } catch (err) {
      setError("更新设置时发生错误");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg mx-auto shadow-md max-w-2xl p-6">
        <h1 className="font-bold mb-6 text-2xl">账户设置</h1>

        {success && (
          <div className="border rounded bg-green-100 border-green-400 mb-4 py-3 px-4 text-green-700">
            设置已成功更新
          </div>
        )}

        {error && (
          <div className="border rounded bg-red-100 border-red-400 mb-4 py-3 px-4 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h2 className="font-semibold text-lg mb-4">基本信息</h2>

            <div className="mb-4">
              <label
                className="font-bold text-sm mb-2 text-gray-700 block"
                htmlFor="username"
              >
                用户名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="border rounded shadow leading-tight w-full py-2 px-3 text-gray-700 appearance-none focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4">
              <label
                className="font-bold text-sm mb-2 text-gray-700 block"
                htmlFor="email"
              >
                电子邮箱
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="border rounded shadow leading-tight w-full py-2 px-3 text-gray-700 appearance-none focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4">
              <label
                className="font-bold text-sm mb-2 text-gray-700 block"
                htmlFor="walletAddress"
              >
                钱包地址
              </label>
              <input
                id="walletAddress"
                name="walletAddress"
                type="text"
                value={formData.walletAddress}
                onChange={handleChange}
                className="border rounded shadow leading-tight w-full py-2 px-3 text-gray-700 appearance-none focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="font-semibold text-lg mb-4">修改密码</h2>

            <div className="mb-4">
              <label
                className="font-bold text-sm mb-2 text-gray-700 block"
                htmlFor="currentPassword"
              >
                当前密码
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                className="border rounded shadow leading-tight w-full py-2 px-3 text-gray-700 appearance-none focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4">
              <label
                className="font-bold text-sm mb-2 text-gray-700 block"
                htmlFor="password"
              >
                新密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="border rounded shadow leading-tight w-full py-2 px-3 text-gray-700 appearance-none focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4">
              <label
                className="font-bold text-sm mb-2 text-gray-700 block"
                htmlFor="confirmPassword"
              >
                确认新密码
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="border rounded shadow leading-tight w-full py-2 px-3 text-gray-700 appearance-none focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "保存中..." : "保存设置"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default SettingsPage;

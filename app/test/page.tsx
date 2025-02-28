"use client";

import React, { useState } from "react";
import { isAddress } from "viem";
import DashboardLayout from "../dashboard-layout";

// 为window.ethereum添加类型声明
declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function TestPage() {
  const [productId, setProductId] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [txStatus, setTxStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // 连接钱包获取地址
  const connectWallet = async () => {
    try {
      setTxStatus("正在连接钱包...");

      // 检查是否有MetaMask
      if (!window.ethereum) {
        throw new Error("请安装MetaMask钱包");
      }

      // 请求账户
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0];
      setUserAddress(account);
      setTxStatus(`钱包已连接: ${account}`);
    } catch (error: any) {
      console.error("连接钱包失败:", error);
      setTxStatus("错误: " + error.message);
    }
  };

  // 提交订单
  const submitOrder = async () => {
    if (!productId || !userAddress) {
      setTxStatus("请填写产品ID和用户地址");
      return;
    }

    if (!isAddress(userAddress)) {
      setTxStatus("无效的用户地址格式");
      return;
    }

    try {
      setLoading(true);
      setTxStatus("提交订单中...");

      // 调用创建订单API
      const response = await fetch("/api/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          userAddress,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || "创建订单失败");
      }

      setTxStatus("订单提交成功: " + JSON.stringify(data));
      setLoading(false);
    } catch (error: any) {
      console.error("提交订单失败:", error);
      setTxStatus("错误: " + error.message);
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">订单测试页面</h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">提交订单</h2>

          <div className="mb-4">
            <label className="block mb-2">产品ID: </label>
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="输入产品ID"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2">用户地址: </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                placeholder="输入用户地址"
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={connectWallet}
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                连接钱包
              </button>
            </div>
          </div>

          <button
            onClick={submitOrder}
            disabled={loading || !productId || !userAddress}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed w-full"
          >
            {loading ? "提交中..." : "提交订单"}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">状态:</h3>
          <pre className="whitespace-pre-wrap break-words bg-gray-100 p-4 rounded">
            {txStatus}
          </pre>
        </div>
      </div>
    </DashboardLayout>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  parseUnits,
  toBytes,
  type Address,
} from "viem";
import { mainnet } from "viem/chains";
import DashboardLayout from "../dashboard-layout";
import { privateKeyToAccount } from "viem/accounts";

export default function TestPage() {
  const [publicClient, setPublicClient] = useState<any>(null);
  const [walletClient, setWalletClient] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("");
  const [txStatus, setTxStatus] = useState("");
  const [account, setAccount] = useState<Address | null>(null);

  // 合约 ABI
  const CONTRACT_ABI = [
    {
      name: "payWithNative",
      type: "function",
      stateMutability: "payable",
      inputs: [{ name: "message", type: "string" }],
      outputs: [],
    },
    {
      name: "payWithERC20",
      type: "function",
      stateMutability: "nonpayable",
      inputs: [
        { name: "token", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "message", type: "string" },
      ],
      outputs: [],
    },
  ] as const;

  // 合约地址
  const CONTRACT_ADDRESS =
    "0x1234567890123456789012345678901234567890" as Address; // 替换为您的合约地址

  // USDT 代币地址
  const USDT_ADDRESS = "0xd41D4FeF58b8c008F6e4d9614f2Fa9ed2Aec8aAb" as Address; // Ethereum Mainnet USDT

  useEffect(() => {
    // 初始化公共客户端和钱包客户端
    const initClients = () => {
      const publicClient = createPublicClient({
        chain: mainnet, // 或其他链，如 sepolia, goerli 等
        transport: http(),
      });

      setPublicClient(publicClient);

      // 使用硬编码的私钥初始化钱包客户端（仅用于测试）
      const testPrivateKey = process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY; // 替换为测试私钥

      try {
        console.log(`0x${testPrivateKey}`);
        const account = privateKeyToAccount(`0x${testPrivateKey}`);
        setAccount(account.address);

        const walletClient = createWalletClient({
          account,
          chain: mainnet,
          transport: http()
        });

        setWalletClient(walletClient);
        setTxStatus(`钱包已连接: ${account.address}`);
      } catch (error: any) {
        console.error("初始化钱包失败:", error);
        setTxStatus("错误: " + error.message);
      }
    };

    initClients();
  }, []);

  // 构建原生代币支付交易
  const buildNativePaymentTx = async () => {
    if (!publicClient || !walletClient || !amount || !message) {
      setTxStatus("请填写完整信息并连接钱包");
      return;
    }

    try {
      setTxStatus("发送交易...");

      // 发送交易
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "payWithNative",
        args: [message],
        value: parseEther(amount),
      });

      setTxStatus("交易已提交: " + hash);

      // 等待交易确认
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      setTxStatus("交易已确认，区块: " + receipt.blockNumber);
    } catch (error: any) {
      console.error("交易失败:", error);
      setTxStatus("错误: " + error.message);
    }
  };

  // 构建 ERC20 代币支付交易
  const buildERC20PaymentTx = async (tokenAddress: Address) => {
    if (!publicClient || !walletClient || !amount || !message) {
      setTxStatus("请填写完整信息并连接钱包");
      return;
    }

    try {
      setTxStatus("构建 ERC20 交易...");

      // ERC20 代币小数位数 ABI
      const decimalsAbi = [
        {
          name: "decimals",
          type: "function",
          stateMutability: "view",
          inputs: [],
          outputs: [{ type: "uint8" }],
        },
      ] as const;

      // 获取代币小数位数
      const decimals = await publicClient.readContract({
        address: tokenAddress,
        abi: decimalsAbi,
        functionName: "decimals",
      });

      // 计算代币金额
      const tokenAmount = parseUnits(amount, decimals);

      // 发送交易
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "payWithERC20",
        args: [tokenAddress, tokenAmount, message],
      });

      setTxStatus("交易已提交: " + hash);

      // 等待交易确认
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      setTxStatus("交易已确认，区块: " + receipt.blockNumber);
    } catch (error: any) {
      console.error("ERC20 交易失败:", error);
      setTxStatus("错误: " + error.message);
    }
  };

  // 批准 ERC20 代币支付
  const approveERC20 = async (tokenAddress: Address) => {
    if (!publicClient || !walletClient || !amount) {
      setTxStatus("请填写金额并连接钱包");
      return;
    }

    try {
      setTxStatus("检查授权额度...");

      // ERC20 授权和查询授权额度的 ABI
      const erc20Abi = [
        {
          name: "approve",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" },
          ],
          outputs: [{ type: "bool" }],
        },
        {
          name: "allowance",
          type: "function",
          stateMutability: "view",
          inputs: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
          ],
          outputs: [{ type: "uint256" }],
        },
      ] as const;

      // 获取代币小数位数
      const decimalsAbi = [
        {
          name: "decimals",
          type: "function",
          stateMutability: "view",
          inputs: [],
          outputs: [{ type: "uint8" }],
        },
      ] as const;

      const decimals = await publicClient.readContract({
        address: tokenAddress,
        abi: decimalsAbi,
        functionName: "decimals",
      });

      // 计算代币金额
      const tokenAmount = parseUnits(amount, decimals);

      // 获取当前账户地址
      const [address] = await walletClient.getAddresses();

      // 检查当前授权额度
      const currentAllowance = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address, CONTRACT_ADDRESS],
      });

      // 如果当前授权额度足够，则无需再次授权
      if (currentAllowance >= tokenAmount) {
        setTxStatus("授权额度充足，无需再次授权");
        return;
      }

      setTxStatus("发送授权交易...");

      // 发送授权交易
      const hash = await walletClient.writeContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [CONTRACT_ADDRESS, tokenAmount],
      });

      setTxStatus("授权交易已提交: " + hash);

      // 等待交易确认
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      setTxStatus("授权交易已确认，区块: " + receipt.blockNumber);
    } catch (error: any) {
      console.error("ERC20 授权失败:", error);
      setTxStatus("错误: " + error.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">支付 DApp 示例</h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          {account && (
            <div className="p-3 bg-gray-100 rounded">
              <p className="font-medium">已连接账户: </p>
              <p className="break-all">{account}</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">支付信息</h2>
          <div className="mb-4">
            <label className="block mb-2">商品信息: </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="输入商品信息"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2">金额: </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => {
                // 只允许输入数字和小数点
                const re = /^[0-9]*[.]?[0-9]*$/;
                if (e.target.value === "" || re.test(e.target.value)) {
                  setAmount(e.target.value);
                }
              }}
              placeholder="输入金额"
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            onClick={buildNativePaymentTx}
            disabled={!walletClient || !amount || !message}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed mb-4 w-full"
          >
            使用 ETH 支付
          </button>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">ERC20 支付</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => approveERC20(USDT_ADDRESS)}
                disabled={!walletClient || !amount}
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex-1"
              >
                授权 USDT
              </button>
              <button
                onClick={() => buildERC20PaymentTx(USDT_ADDRESS)}
                disabled={!walletClient || !amount || !message}
                className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex-1"
              >
                使用 USDT 支付
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="text-lg font-semibold mb-2">交易状态:</h3>
            <p className="break-words">{txStatus}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

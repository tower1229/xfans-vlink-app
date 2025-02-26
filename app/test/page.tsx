"use client";

import React, { useState, useEffect } from "react";
import {
  createPublicClient,
  http,
  parseEther,
  parseUnits,
  encodeFunctionData,
  parseAbi,
  type Abi,
  type Address,
} from "viem";
import { mainnet } from "viem/chains";
import axios from "axios";

export default function TestPage() {
  const [client, setClient] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("");
  const [txStatus, setTxStatus] = useState("");

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
  // 签名服务 API 端点
  const SIGNING_SERVICE_URL = "https://your-signing-service.com/sign";
  // 用户地址 (将由签名服务使用的地址)
  const USER_ADDRESS = "0x0000000000000000000000000000000000000000" as Address; // 替换为您的地址

  // USDT 代币地址
  const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7" as Address; // Ethereum Mainnet USDT

  useEffect(() => {
    // 初始化公共客户端
    const initClient = () => {
      const publicClient = createPublicClient({
        chain: mainnet, // 或其他链，如 sepolia, goerli 等
        transport: http(),
      });

      setClient(publicClient);
    };

    initClient();
  }, []);

  // 构建原生代币支付交易
  const buildNativePaymentTx = async () => {
    if (!client || !amount || !message) {
      setTxStatus("请填写完整信息");
      return;
    }

    try {
      setTxStatus("构建交易...");

      // 构建交易数据
      const data = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: "payWithNative",
        args: [message],
      });

      // 获取当前 gas 价格和 nonce
      const [gasPrice, nonce] = await Promise.all([
        client.getGasPrice(),
        client.getTransactionCount({ address: USER_ADDRESS }),
      ]);

      // 估算 gas 限制
      const gasEstimate = await client.estimateGas({
        account: USER_ADDRESS,
        to: CONTRACT_ADDRESS,
        data,
        value: parseEther(amount),
      });

      // 构建未签名的交易对象
      const unsignedTx = {
        to: CONTRACT_ADDRESS,
        data,
        value: parseEther(amount),
        gasPrice,
        gas: gasEstimate,
        nonce,
        chainId: client.chain.id,
      };

      // 发送到签名服务
      await signAndSendTransaction(unsignedTx);
    } catch (error: any) {
      console.error("交易构建失败:", error);
      setTxStatus("错误: " + error.message);
    }
  };

  // 构建 ERC20 代币支付交易
  const buildERC20PaymentTx = async (tokenAddress: Address) => {
    if (!client || !amount || !message) {
      setTxStatus("请填写完整信息");
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
      const decimals = await client.readContract({
        address: tokenAddress,
        abi: decimalsAbi,
        functionName: "decimals",
      });

      // 计算代币金额
      const tokenAmount = parseUnits(amount, decimals);

      // 构建交易数据
      const data = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: "payWithERC20",
        args: [tokenAddress, tokenAmount, message],
      });

      // 获取当前 gas 价格和 nonce
      const [gasPrice, nonce] = await Promise.all([
        client.getGasPrice(),
        client.getTransactionCount({ address: USER_ADDRESS }),
      ]);

      // 估算 gas 限制
      const gasEstimate = await client.estimateGas({
        account: USER_ADDRESS,
        to: CONTRACT_ADDRESS,
        data,
        value: BigInt(0),
      });

      // 构建未签名的交易对象
      const unsignedTx = {
        to: CONTRACT_ADDRESS,
        data,
        value: BigInt(0),
        gasPrice,
        gas: gasEstimate,
        nonce,
        chainId: client.chain.id,
      };

      // 发送到签名服务
      await signAndSendTransaction(unsignedTx);
    } catch (error: any) {
      console.error("ERC20 交易构建失败:", error);
      setTxStatus("错误: " + error.message);
    }
  };

  // 发送交易到签名服务并广播已签名的交易
  const signAndSendTransaction = async (unsignedTx: any) => {
    if (!client) return;

    try {
      setTxStatus("请求签名...");

      // 将 BigInt 转换为字符串，以便 JSON 序列化
      const txForSigning = {
        ...unsignedTx,
        value: unsignedTx.value.toString(),
        gasPrice: unsignedTx.gasPrice.toString(),
        gas: unsignedTx.gas.toString(),
        chainId: unsignedTx.chainId.toString(),
      };

      // 发送未签名的交易到签名服务
      const response = await axios.post(SIGNING_SERVICE_URL, {
        transaction: txForSigning,
        // 可能需要添加认证信息
        auth: "your-auth-token",
      });

      // 获取签名后的交易
      const signedTx = response.data.signedTransaction;

      setTxStatus("广播交易...");

      // 发送已签名的交易
      const txHash = await client.sendRawTransaction({
        serializedTransaction: signedTx,
      });

      setTxStatus("交易已提交: " + txHash);

      // 等待交易确认
      const receipt = await client.waitForTransactionReceipt({ hash: txHash });
      setTxStatus("交易已确认，区块: " + receipt.blockNumber);
    } catch (error: any) {
      console.error("签名或发送失败:", error);
      setTxStatus("错误: " + error.message);
    }
  };

  // 批准 ERC20 代币支付
  const approveERC20 = async (tokenAddress: Address) => {
    if (!client || !amount) {
      setTxStatus("请填写金额");
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

      const decimals = await client.readContract({
        address: tokenAddress,
        abi: decimalsAbi,
        functionName: "decimals",
      });

      // 计算代币金额
      const tokenAmount = parseUnits(amount, decimals);

      // 检查当前授权额度
      const currentAllowance = await client.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [USER_ADDRESS, CONTRACT_ADDRESS],
      });

      // 如果当前授权额度足够，则无需再次授权
      if (currentAllowance >= tokenAmount) {
        setTxStatus("授权额度充足，无需再次授权");
        return;
      }

      setTxStatus("构建授权交易...");

      // 构建授权交易数据
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [CONTRACT_ADDRESS, tokenAmount],
      });

      // 获取当前 gas 价格和 nonce
      const [gasPrice, nonce] = await Promise.all([
        client.getGasPrice(),
        client.getTransactionCount({ address: USER_ADDRESS }),
      ]);

      // 估算 gas 限制
      const gasEstimate = await client.estimateGas({
        account: USER_ADDRESS,
        to: tokenAddress,
        data,
        value: BigInt(0),
      });

      // 构建未签名的交易对象
      const unsignedTx = {
        to: tokenAddress,
        data,
        value: BigInt(0),
        gasPrice,
        gas: gasEstimate,
        nonce,
        chainId: client.chain.id,
      };

      // 发送到签名服务
      await signAndSendTransaction(unsignedTx);
    } catch (error: any) {
      console.error("ERC20 授权失败:", error);
      setTxStatus("错误: " + error.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">支付 DApp 示例</h1>

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
          disabled={!client || !amount || !message}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed mb-4 w-full"
        >
          使用 ETH 支付
        </button>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">ERC20 支付</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => approveERC20(USDT_ADDRESS)}
              disabled={!client || !amount}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex-1"
            >
              授权 USDT
            </button>
            <button
              onClick={() => buildERC20PaymentTx(USDT_ADDRESS)}
              disabled={!client || !amount || !message}
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
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { isAddress, decodeFunctionData, parseAbi, encodeFunctionData } from "viem";
import { WalletClient, createPublicClient, http } from "viem";
import { mainnet, sepolia } from "viem/chains";
import DashboardLayout from "../dashboard-layout";
import { getWalletClient } from "@/utils/walletUtils";
import { fetchWithAuth } from "../utils/api";

// 定义交易参数类型
interface TransactionParams {
  to: `0x${string}`;
  data: `0x${string}`;
  value?: string;
  chainId?: string;
  gas?: bigint;
}

export default function TestPage() {
  const [productId, setProductId] = useState("c9771efe-49f4-4c50-9858-d74c6d9cb553");
  const [userAddress, setUserAddress] = useState("");
  const [chainId] = useState("11155111"); // 固定为Sepolia测试网
  const [txStatus, setTxStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [useHighGas, setUseHighGas] = useState(false); // 启用高gas
  const [customGasLimit, setCustomGasLimit] = useState("10000000"); // 默认较高的gas limit
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [publicClient, setPublicClient] = useState<any>(null);

  // 初始化时自动连接钱包
  useEffect(() => {
    // 自动连接钱包
    connectWallet();
  }, [chainId]);

  // 连接钱包获取地址
  const connectWallet = async () => {
    try {
      setTxStatus("正在连接钱包...");

      // 从环境变量获取私钥 (需要使用NEXT_PUBLIC_前缀的环境变量)
      const privateKey = process.env.NEXT_PUBLIC_VERIFIER_PRIVATE_KEY;
      const paymentContractAddress = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS;

      // 检查私钥是否存在且不为空
      if (!privateKey || privateKey.trim() === '') {
        throw new Error("环境变量中未设置NEXT_PUBLIC_VERIFIER_PRIVATE_KEY或私钥为空");
      }

      // 检查私钥格式是否正确
      if (privateKey.replace(/^0x/, '').length !== 64) {
        throw new Error("私钥格式不正确，应为32字节的十六进制字符串（带或不带0x前缀）");
      }

      if (!paymentContractAddress) {
        throw new Error("环境变量中未设置NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS");
      }

      if (!chainId) {
        throw new Error("链ID未设置");
      }

      // 获取链对象
      const chain = sepolia; // 固定使用Sepolia测试网

      // 使用私钥和链ID创建钱包客户端
      const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
      const client = getWalletClient(formattedPrivateKey as `0x${string}`, parseInt(chainId));
      // 使用类型断言确保类型兼容
      setWalletClient(client as WalletClient);

      // 创建公共客户端用于读取操作
      const pubClient = createPublicClient({
        chain,
        transport: http(),
      });
      setPublicClient(pubClient);

      // 获取账户地址
      // 使用类型断言访问account属性
      const account = (client as any).account?.address;
      if (account) {
        setUserAddress(account);
        setTxStatus(`钱包已连接: ${account}\n合约地址: ${paymentContractAddress}`);
      } else {
        throw new Error("无法获取钱包地址");
      }
    } catch (error: any) {
      console.error("连接钱包失败:", error);
      setTxStatus("错误: " + error.message);
      // 清除钱包客户端状态，确保UI显示未连接状态
      setWalletClient(null);
      setUserAddress("");
    }
  };

  // 解码交易数据
  const decodeTransactionData = (data: string) => {
    try {
      if (!data.startsWith('0x')) {
        throw new Error("交易数据不是0x开头的十六进制字符串");
      }
      // 支付合约ABI
      const paymentContractAbi = parseAbi([
        'function payWithNative(bytes orderData, bytes signature) payable',
        'function payWithERC20(address token, uint256 amount, bytes orderData, bytes signature)',
      ]);

      // 解码函数调用
      const decodedData = decodeFunctionData({
        abi: paymentContractAbi,
        data: data as `0x${string}`,
      });

      return {
        functionName: decodedData.functionName,
        args: decodedData.args,
      };
    } catch (error) {
      console.error("解码交易数据失败:", error);
      throw new Error("解码交易数据失败");
    }
  };

  // 处理ERC20授权
  const handleERC20Approval = async (tokenAddress: string, amount: bigint, spenderAddress: string) => {
    try {
      if (!walletClient || !publicClient || !walletClient.account) {
        throw new Error("钱包未连接");
      }

      // 获取链对象
      const chain = sepolia; // 固定使用Sepolia测试网

      setTxStatus("正在授权ERC20代币...");

      // ERC20 ABI
      const erc20Abi = parseAbi([
        'function approve(address spender, uint256 amount) returns (bool)',
        'function allowance(address owner, address spender) view returns (uint256)',
      ]);

      // 检查当前授权额度
      const currentAllowance = await publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [userAddress as `0x${string}`, spenderAddress as `0x${string}`],
      });

      // 如果授权额度不足，则进行授权
      if (currentAllowance < amount) {
        // 编码approve函数调用
        const approveData = encodeFunctionData({
          abi: erc20Abi,
          functionName: 'approve',
          args: [spenderAddress as `0x${string}`, amount],
        });

        // 发送授权交易
        const approveTxHash = await walletClient.sendTransaction({
          account: walletClient.account,
          chain,
          to: tokenAddress as `0x${string}`,
          data: approveData,
        });

        setTxStatus(`ERC20授权交易已发送: ${approveTxHash}`);

        // 等待授权交易确认
        const receipt = await publicClient.waitForTransactionReceipt({ hash: approveTxHash });
        setTxStatus(`ERC20授权已完成: ${approveTxHash}`);
      } else {
        setTxStatus("ERC20授权额度已足够，无需再次授权");
      }

      return true;
    } catch (error: any) {
      console.error("ERC20授权失败:", error);
      setTxStatus("ERC20授权失败: " + error.message);
      return false;
    }
  };

  // 估算交易所需的gas
  const estimateGas = async (txParams: TransactionParams): Promise<bigint> => {
    try {
      if (!walletClient || !publicClient || !walletClient.account) {
        throw new Error("钱包未连接");
      }

      // 创建一个用于估算的参数对象
      const estimateParams = {
        account: walletClient.account,
        to: txParams.to,
        data: txParams.data,
        value: txParams.value ? BigInt(txParams.value) : undefined,
      };

      try {
        // 调用estimateGas方法
        const gasEstimate = await publicClient.estimateGas(estimateParams);

        // 将估算结果增加100%作为安全边际，因为这个合约操作复杂
        const gasWithBuffer = gasEstimate * BigInt(2);

        // 确保gas不低于一个最小值
        const minGas = BigInt(150000); // 为复杂合约设置较高的最小值
        const finalGas = gasWithBuffer > minGas ? gasWithBuffer : minGas;

        console.log(`Gas估算: 原始=${gasEstimate}, 带缓冲=${gasWithBuffer}, 最终=${finalGas}`);

        return finalGas;
      } catch (error: any) {
        console.error("估算gas失败:", error);
        // 如果估算失败，返回一个非常高的默认值
        setTxStatus(`估算gas失败: ${error.message || "未知错误"}\n使用默认高gas限制: ${customGasLimit}`);
        return BigInt(parseInt(customGasLimit)); // 使用自定义的高gas限制
      }
    } catch (error: any) {
      console.error("估算gas失败:", error);
      // 如果估算失败，返回一个非常高的默认值
      return BigInt(parseInt(customGasLimit)); // 使用自定义的高gas限制
    }
  };

  // 检查用户余额是否足够支付交易
  const checkBalance = async (txParams: TransactionParams, gasLimit: bigint): Promise<boolean> => {
    try {
      if (!walletClient || !publicClient || !walletClient.account) {
        throw new Error("钱包未连接");
      }

      // 获取当前gas价格
      const gasPrice = await publicClient.getGasPrice();

      // 计算交易所需的总ETH（交易value + gas费用）
      const valueWei = txParams.value ? BigInt(txParams.value) : BigInt(0);
      const gasCostWei = gasLimit * gasPrice;
      const totalRequired = valueWei + gasCostWei;

      // 获取用户余额
      const balance = await publicClient.getBalance({
        address: walletClient.account.address,
      });

      // 检查余额是否足够
      if (balance < totalRequired) {
        setTxStatus(`余额不足: 需要 ${totalRequired.toString()} wei，但只有 ${balance.toString()} wei`);
        return false;
      }

      return true;
    } catch (error) {
      console.error("检查余额失败:", error);
      return false;
    }
  };

  // 提交订单
  const submitOrder = async () => {
    if (!productId) {
      setTxStatus("请填写产品ID和用户地址");
      return;
    }

    if (!walletClient) {
      setTxStatus("请先连接钱包");
      return;
    }

    try {
      setLoading(true);
      setTxStatus("提交订单中...");

      // 调用创建订单API
      const response = await fetchWithAuth("/api/v1/orders", {
        method: "POST",
        body: JSON.stringify({
          productId,
          chainId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        // 处理API返回的错误
        const errorMessage = data.error?.message || "创建订单失败";

        // 检查是否是私钥相关错误
        if (errorMessage.includes("未配置签名私钥") || errorMessage.includes("签名生成失败")) {
          throw new Error(`服务器配置错误: ${errorMessage}。请联系管理员配置正确的签名私钥。`);
        }

        throw new Error(errorMessage);
      }

      setTxStatus("订单提交成功，准备处理支付交易...");

      // 获取交易对象
      const transaction = data.data.transaction;

      // 解码交易数据
      const decodedData = decodeTransactionData(transaction.data);
      setTxStatus(`解码交易数据: 函数名=${decodedData.functionName}`);

      // 根据函数名判断支付类型
      if (decodedData.functionName === 'payWithERC20') {
        // ERC20支付
        const [tokenAddress, amount, orderData, signature] = decodedData.args;

        // 先进行ERC20授权
        const approvalSuccess = await handleERC20Approval(
          tokenAddress as string,
          amount as bigint,
          transaction.to // 支付合约地址
        );

        if (!approvalSuccess) {
          throw new Error("ERC20授权失败，无法继续支付");
        }
      }

      // 发送交易
      setTxStatus("正在发送支付交易...");
      const txParams: TransactionParams = {
        to: transaction.to as `0x${string}`,
        data: transaction.data as `0x${string}`,
      };

      // 根据支付类型添加value
      if (decodedData.functionName === 'payWithNative') {
        txParams.value = transaction.value;
      }

      try {
        // 获取链对象
        const chain = sepolia; // 固定使用Sepolia测试网

        // 设置gas限制
        let gasLimit: bigint;

        if (useHighGas) {
          // 直接使用自定义高gas值
          gasLimit = BigInt(parseInt(customGasLimit));
          setTxStatus(`使用自定义高gas限制: ${customGasLimit} 单位`);
        } else {
          // 尝试估算gas，如果失败会返回默认高值
          setTxStatus("正在估算交易所需的gas...");
          gasLimit = await estimateGas(txParams);
          setTxStatus(`估算gas完成: ${gasLimit.toString()} 单位`);
        }

        // 检查用户余额是否足够支付交易
        const balanceCheck = await checkBalance(txParams, gasLimit);
        if (!balanceCheck) {
          setLoading(false);
          return;
        }

        // 发送交易
        setTxStatus("正在发送支付交易...");

        // 确保 walletClient.account 存在
        if (!walletClient.account) {
          setTxStatus("钱包账户未连接或无效");
          setLoading(false);
          return;
        }

        const txHash = await walletClient.sendTransaction({
          account: walletClient.account,
          chain,
          to: txParams.to,
          data: txParams.data,
          value: txParams.value ? BigInt(txParams.value) : undefined,
          gas: gasLimit,
        });

        setTxStatus(`支付交易已发送: ${txHash}`);

        // 等待交易确认
        setTxStatus(`等待交易确认中...`);
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

        // 检查交易是否成功
        if (receipt && receipt.status === 'success') {
          setTxStatus(`支付交易已确认并成功: ${txHash}`);
        } else {
          setTxStatus(`支付交易已确认但失败: ${txHash}，请检查交易详情`);
        }
      } catch (error: any) {
        console.error("发送交易失败:", error);
        setTxStatus("发送交易失败: " + (error.message || "未知错误"));
        setLoading(false);
        return;
      }

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
              className="w-full p-2 border rounded-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">链ID: </label>
            <input
              type="text"
              value={chainId}
              readOnly
              className="w-full p-2 border rounded-sm bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              固定使用Sepolia测试网 (11155111)
            </p>
          </div>

          <div className="mb-6">
            <label className="block mb-2">用户地址: </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                placeholder="钱包地址将自动填充"
                className="flex-1 p-2 border rounded-sm"
                readOnly={true}
              />
              <button
                onClick={connectWallet}
                className="bg-gray-500 text-white py-2 px-4 rounded-sm hover:bg-gray-600"
              >
                刷新钱包
              </button>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="useHighGas"
                checked={useHighGas}
                onChange={(e) => setUseHighGas(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="useHighGas" className="font-medium">
                使用自定义Gas限制（推荐，解决交易失败问题）
              </label>
            </div>

            <div className="ml-6">
              <label className="block mb-2 text-sm">Gas限制: </label>
              <input
                type="text"
                value={customGasLimit}
                onChange={(e) => setCustomGasLimit(e.target.value)}
                placeholder="输入Gas限制"
                className="w-full p-2 border rounded-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                推荐值: 800,000 - 1,000,000（复杂合约可能需要更高的Gas限制）
              </p>
            </div>
          </div>

          <button
            onClick={submitOrder}
            disabled={loading || !productId || !userAddress || !walletClient}
            className="bg-blue-500 text-white py-2 px-4 rounded-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed w-full"
          >
            {loading ? "提交中..." : "提交订单"}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">状态:</h3>
          <pre className="whitespace-pre-wrap break-words bg-gray-100 p-4 rounded-sm">
            {txStatus}
          </pre>
        </div>
      </div>
    </DashboardLayout>
  );
}

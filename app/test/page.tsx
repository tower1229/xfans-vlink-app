"use client";

import React, { useState, useEffect } from "react";
import {
  createWalletClient,
  createPublicClient,
  http,
  parseAbi,
  formatUnits,
  encodeFunctionData,
  decodeFunctionData,
  type WalletClient,
  type PublicClient,
  type Hex,
} from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import DashboardLayout from "../(core)/dashboard-layout";
import { createOrder } from "../_actions/orderActions";
import PaymentContractABI from "@/_lib/PaymentContract.json";

// 定义交易参数接口
interface TransactionParams {
  to: `0x${string}`;
  data: `0x${string}`;
  value?: string;
  chainId?: string;
  gas?: bigint;
}

// 确保字符串是有效的0x前缀十六进制字符串
function ensureHex(value: string): `0x${string}` {
  if (typeof value !== "string") {
    throw new Error("输入必须是字符串");
  }

  if (!value.startsWith("0x")) {
    return `0x${value}` as `0x${string}`;
  }
  return value as `0x${string}`;
}

export default function TestPage() {
  const [productId, setProductId] = useState(
    "56685929-3585-4661-9db4-f5f7213f0eec"
  );
  const [userAddress, setUserAddress] = useState("");
  const [chainId] = useState("11155111"); // 固定为Sepolia测试网
  const [txStatus, setTxStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [useHighGas, setUseHighGas] = useState(false); // 启用高gas
  const [customGasLimit, setCustomGasLimit] = useState("10000000"); // 默认较高的gas limit
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);

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
      const privateKey =
        "55353dfe8cf267312c2f81ebfbcee94468836bddb780f00e0e700f37095febf5";
      const paymentContractAddress =
        process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS;

      // 检查私钥是否存在且不为空
      if (!privateKey || privateKey.trim() === "") {
        throw new Error(
          "环境变量中未设置NEXT_PUBLIC_VERIFIER_PRIVATE_KEY或私钥为空"
        );
      }

      // 检查私钥格式是否正确
      if (privateKey.replace(/^0x/, "").length !== 64) {
        throw new Error(
          "私钥格式不正确，应为32字节的十六进制字符串（带或不带0x前缀）"
        );
      }

      // 创建账户
      const formattedPrivateKey = privateKey.startsWith("0x")
        ? privateKey
        : `0x${privateKey}`;
      const account = privateKeyToAccount(formattedPrivateKey as Hex);
      setUserAddress(account.address);

      // 创建公共客户端
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(),
      });
      setPublicClient(publicClient);

      // 创建钱包客户端
      const walletClient = createWalletClient({
        account,
        chain: sepolia,
        transport: http(),
      });
      setWalletClient(walletClient);

      setTxStatus(`钱包已连接: ${account.address}`);
    } catch (error: any) {
      console.error("连接钱包失败:", error);
      setTxStatus("错误: " + error.message);
    }
  };

  // 处理ERC20授权
  const handleERC20Approval = async (
    tokenAddress: string,
    amount: bigint,
    spenderAddress: string
  ) => {
    if (!walletClient || !publicClient) {
      setTxStatus("钱包未连接");
      return null;
    }

    try {
      setTxStatus("准备授权ERC20代币...");

      // 检查当前授权额度
      const erc20Abi = parseAbi([
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)",
      ]);

      try {
        const currentAllowance = await publicClient.readContract({
          address: ensureHex(tokenAddress),
          abi: erc20Abi,
          functionName: "allowance",
          args: [walletClient.account!.address, ensureHex(spenderAddress)],
        });

        setTxStatus(`当前授权额度: ${currentAllowance.toString()}`);

        // 如果当前授权额度已经足够，则不需要再次授权
        if (currentAllowance >= amount) {
          setTxStatus(`当前授权额度已足够，无需再次授权`);
          return "0x0000000000000000000000000000000000000000000000000000000000000000"; // 返回一个虚拟的hash表示成功
        }
      } catch (error) {
        console.error("检查授权额度失败:", error);
        setTxStatus("检查授权额度失败，将继续进行授权");
      }

      // 编码函数调用数据
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [ensureHex(spenderAddress), amount],
      });

      // 构建交易参数
      const txParams: TransactionParams = {
        to: ensureHex(tokenAddress),
        data: data as `0x${string}`,
        chainId,
      };

      // 估算gas
      const gasLimit = await estimateGas(txParams);
      if (!gasLimit) return null;

      // 检查余额
      const hasEnoughBalance = await checkBalance(txParams, gasLimit);
      if (!hasEnoughBalance) return null;

      // 发送交易
      const hash = await walletClient.sendTransaction({
        account: walletClient.account!,
        to: txParams.to,
        data: txParams.data,
        gas: gasLimit,
        chain: sepolia,
      });

      setTxStatus(`授权交易已提交: ${hash}`);

      // 等待授权交易确认
      setTxStatus("等待授权交易确认中...");
      try {
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: hash,
          confirmations: 1,
          timeout: 60_000, // 60秒超时
        });

        if (receipt.status === "success") {
          setTxStatus(`授权交易已确认，状态: 成功`);
        } else {
          setTxStatus(`授权交易已确认，状态: 失败`);
          return null;
        }
      } catch (error) {
        console.error("等待授权交易确认失败:", error);
        setTxStatus("等待授权交易确认超时，但将继续尝试支付");
      }

      return hash;
    } catch (error: any) {
      console.error("ERC20授权失败:", error);
      setTxStatus("授权错误: " + error.message);
      return null;
    }
  };

  // 估算gas
  const estimateGas = async (txParams: TransactionParams): Promise<bigint> => {
    if (!publicClient || !walletClient) {
      setTxStatus("钱包未连接");
      return BigInt(0);
    }

    try {
      setTxStatus("估算Gas...");

      let gasLimit: bigint;

      if (useHighGas) {
        // 使用自定义gas限制
        gasLimit = BigInt(customGasLimit);
        setTxStatus(`使用自定义Gas限制: ${formatUnits(gasLimit, 0)}`);
      } else {
        // 估算gas
        try {
          gasLimit = await publicClient.estimateGas({
            account: walletClient.account?.address,
            to: txParams.to,
            data: txParams.data,
            value: txParams.value ? BigInt(txParams.value) : undefined,
          });

          // 增加20%的缓冲
          gasLimit = (gasLimit * BigInt(120)) / BigInt(100);
          setTxStatus(`估算Gas: ${formatUnits(gasLimit, 0)}`);
        } catch (error) {
          console.error("Gas估算失败:", error);
          setTxStatus("Gas估算失败，使用默认值");
          gasLimit = BigInt(customGasLimit); // 使用默认值
        }
      }

      return gasLimit;
    } catch (error: any) {
      console.error("估算Gas失败:", error);
      setTxStatus("估算Gas错误: " + error.message);
      return BigInt(0);
    }
  };

  // 检查余额
  const checkBalance = async (
    txParams: TransactionParams,
    gasLimit: bigint
  ): Promise<boolean> => {
    if (!publicClient || !walletClient || !walletClient.account) {
      setTxStatus("钱包未连接");
      return false;
    }

    try {
      setTxStatus("检查余额...");

      // 获取当前gas价格
      const gasPrice = await publicClient.getGasPrice();

      // 计算交易所需的总ETH（gas费用 + 发送的ETH）
      const gasCost = gasLimit * gasPrice;
      const valueToSend = txParams.value ? BigInt(txParams.value) : BigInt(0);
      const totalCost = gasCost + valueToSend;

      // 获取账户余额
      const balance = await publicClient.getBalance({
        address: walletClient.account.address,
      });

      // 检查余额是否足够
      if (balance < totalCost) {
        setTxStatus(
          `余额不足。需要: ${formatUnits(
            totalCost,
            18
          )} ETH, 当前余额: ${formatUnits(balance, 18)} ETH`
        );
        return false;
      }

      setTxStatus(`余额充足。当前余额: ${formatUnits(balance, 18)} ETH`);
      return true;
    } catch (error: any) {
      console.error("检查余额失败:", error);
      setTxStatus("检查余额错误: " + error.message);
      return false;
    }
  };

  // 提交订单
  const submitOrder = async () => {
    if (!productId || !userAddress) {
      setTxStatus("请填写产品ID和用户地址");
      return;
    }

    if (!walletClient || !publicClient) {
      setTxStatus("钱包未连接");
      return;
    }

    try {
      setLoading(true);
      setTxStatus("提交订单中...");

      // 调用创建订单API，使用fetchWithAuth替代fetch
      const response = await createOrder(productId, chainId);

      if (!response.success) {
        throw new Error(response?.message || "创建订单失败");
      }

      setTxStatus("订单已创建，准备支付...");

      // 获取交易参数
      const transaction = JSON.parse(
        Buffer.from(response.data.transaction, "base64").toString("utf-8")
      );
      console.log("transaction", transaction);
      const data = decodeFunctionData({
        abi: PaymentContractABI,
        data: transaction.data,
      });
      console.log("decode data", data);

      // 如果是ERC20支付，需要先进行授权
      if (data.functionName === "payWithERC20") {
        setTxStatus("检测到ERC20支付，准备授权...");

        try {
          // 使用正则表达式从交易数据中提取token地址
          // 在payWithERC20函数中，token地址是第一个参数，位于函数选择器之后
          const tokenMatch = transaction.data.match(
            /^0xa62f7ba2000000000000000000000000([a-fA-F0-9]{40})/
          );

          if (!tokenMatch) {
            throw new Error("无法从交易数据中提取token地址");
          }

          const tokenAddress = `0x${tokenMatch[1]}`;

          // 提取金额 - 金额是第二个参数，位于token地址之后的32字节
          const amountHex = transaction.data.slice(74, 138);
          const amount = BigInt(`0x${amountHex}`);

          const spenderAddress = transaction.to; // 支付合约地址

          setTxStatus(
            `准备授权: Token=${tokenAddress}, 金额=${amount}, 接收方=${spenderAddress}`
          );

          // 调用ERC20授权
          const approvalHash = await handleERC20Approval(
            tokenAddress,
            amount,
            spenderAddress
          );

          if (!approvalHash) {
            throw new Error("ERC20授权失败");
          }

          setTxStatus("ERC20授权成功，准备支付...");

          // 添加延迟，确保授权已被区块链网络完全处理
          setTxStatus("等待授权生效...");
          await new Promise((resolve) => setTimeout(resolve, 5000)); // 等待5秒
        } catch (error: any) {
          console.error("解析ERC20支付参数失败:", error);
          setTxStatus(`解析ERC20支付参数失败: ${error.message}`);
          throw new Error(`ERC20授权准备失败: ${error.message}`);
        }
      }

      // 构建交易参数
      const txParams: TransactionParams = {
        to: ensureHex(transaction.to),
        data: ensureHex(transaction.data),
        chainId,
      };

      // 如果有value，添加value
      if (transaction.value && transaction.value !== "0") {
        txParams.value = transaction.value;
      }

      // 估算gas
      const gasLimit = await estimateGas(txParams);
      if (!gasLimit) {
        setLoading(false);
        return;
      }

      // 检查余额
      const hasEnoughBalance = await checkBalance(txParams, gasLimit);
      if (!hasEnoughBalance) {
        setLoading(false);
        return;
      }

      // 发送交易
      const hash = await walletClient.sendTransaction({
        account: walletClient.account!,
        to: txParams.to,
        data: txParams.data,
        value: txParams.value ? BigInt(txParams.value) : undefined,
        gas: gasLimit,
        chain: sepolia,
      });

      setTxStatus("交易已提交: " + hash);

      // 监听交易上链
      setTxStatus("等待交易确认中...");

      try {
        // 等待交易收据
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: hash,
          confirmations: 1, // 等待1个确认
          timeout: 60_000, // 60秒超时
        });

        setTxStatus(
          `交易已确认，区块: ${receipt.blockNumber}, 状态: ${
            receipt.status === "success" ? "成功" : "失败"
          }`
        );

        // 如果交易成功，提示用户
        if (receipt.status === "success") {
          setTxStatus(
            `交易成功！交易哈希: ${hash}，区块: ${receipt.blockNumber}。订单状态将由事件监听器自动更新。`
          );
        } else {
          setTxStatus("交易失败，请检查交易详情");
        }
      } catch (waitError: unknown) {
        console.error("等待交易确认失败:", waitError);
        const errorMessage =
          waitError instanceof Error ? waitError.message : "未知错误";
        setTxStatus(`等待交易确认失败: ${errorMessage}`);

        // 即使等待失败，也可以提供交易哈希让用户手动查询
        setTxStatus(
          `交易可能仍在进行中，您可以使用交易哈希 ${hash} 在区块浏览器中查询状态`
        );
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
        <h1 className="font-bold mb-6 text-2xl">订单测试页面</h1>

        <div className="bg-white rounded-lg shadow-md mb-6 p-6">
          <h2 className="font-semibold text-xl mb-4">提交订单</h2>

          <div className="mb-4">
            <label className="mb-2 block">产品ID: </label>
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="输入产品ID"
              className="border rounded w-full p-2"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block">用户地址: </label>
            <input
              type="text"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              placeholder="输入用户地址"
              className="border rounded w-full p-2"
            />
          </div>

          <div className="mb-6">
            <div className="flex mb-2 items-center">
              <input
                type="checkbox"
                id="useHighGas"
                checked={useHighGas}
                onChange={(e) => setUseHighGas(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="useHighGas">使用自定义Gas限制</label>
            </div>
            {useHighGas && (
              <input
                type="text"
                value={customGasLimit}
                onChange={(e) => setCustomGasLimit(e.target.value)}
                placeholder="输入Gas限制"
                className="border rounded w-full p-2"
              />
            )}
          </div>

          <button
            onClick={submitOrder}
            disabled={loading || !productId || !userAddress || !walletClient}
            className="rounded bg-blue-500 text-white w-full py-2 px-4 hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loading ? "提交中..." : "提交订单"}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-lg mb-2">状态:</h3>
          <pre className="rounded bg-gray-100 p-4 whitespace-pre-wrap break-words">
            {txStatus}
          </pre>
        </div>
      </div>
    </DashboardLayout>
  );
}

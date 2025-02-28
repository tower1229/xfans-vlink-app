"use client";

import React, { useState } from "react";
import { isAddress, decodeFunctionData, parseAbi, encodeFunctionData, fromHex, toHex } from "viem";
import DashboardLayout from "../dashboard-layout";

// 为window.ethereum添加类型声明
declare global {
  interface Window {
    ethereum?: any;
  }
}

// 定义交易参数类型
interface TransactionParams {
  from: string;
  to: string;
  data: string;
  value?: string;
  chainId?: string;
  gas?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export default function TestPage() {
  const [productId, setProductId] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [txStatus, setTxStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [useHighGas, setUseHighGas] = useState(false);
  const [customGasLimit, setCustomGasLimit] = useState("1000000"); // 默认较高的gas limit

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
      setTxStatus("正在授权ERC20代币...");

      // ERC20 ABI
      const erc20Abi = parseAbi([
        'function approve(address spender, uint256 amount) returns (bool)',
        'function allowance(address owner, address spender) view returns (uint256)',
      ]);

      // 检查当前授权额度
      const allowanceResult = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: tokenAddress,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: 'allowance',
            args: [userAddress as `0x${string}`, spenderAddress as `0x${string}`],
          }),
        }, 'latest'],
      });

      // 将结果转换为bigint
      const currentAllowance = BigInt(allowanceResult || '0x0');

      // 如果授权额度不足，则进行授权
      if (currentAllowance < amount) {
        // 编码approve函数调用
        const approveData = encodeFunctionData({
          abi: erc20Abi,
          functionName: 'approve',
          args: [spenderAddress as `0x${string}`, amount],
        });

        // 发送授权交易
        const approveTxHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: userAddress,
            to: tokenAddress,
            data: approveData,
          }],
        });

        setTxStatus(`ERC20授权交易已发送: ${approveTxHash}`);

        // 等待授权交易确认
        await waitForTransaction(approveTxHash);
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

  // 等待交易确认
  const waitForTransaction = async (txHash: string) => {
    return new Promise((resolve, reject) => {
      const checkTx = async () => {
        try {
          const receipt = await window.ethereum.request({
            method: 'eth_getTransactionReceipt',
            params: [txHash],
          });

          if (receipt) {
            resolve(receipt);
          } else {
            setTimeout(checkTx, 2000); // 每2秒检查一次
          }
        } catch (error) {
          reject(error);
        }
      };

      checkTx();
    });
  };

  // 估算交易所需的gas
  const estimateGas = async (txParams: TransactionParams): Promise<string> => {
    try {
      // 创建一个用于估算的参数对象
      const estimateParams = { ...txParams };

      // 调用eth_estimateGas方法
      const gasEstimate = await window.ethereum.request({
        method: 'eth_estimateGas',
        params: [estimateParams],
      });

      // 将估算结果增加50%作为安全边际，因为这个合约操作复杂
      const gasEstimateNum = parseInt(gasEstimate, 16);
      const gasWithBuffer = Math.floor(gasEstimateNum * 1.5);

      // 确保gas不低于一个最小值
      const minGas = 500000; // 为复杂合约设置较高的最小值
      const finalGas = Math.max(gasWithBuffer, minGas);

      console.log(`Gas估算: 原始=${gasEstimateNum}, 带缓冲=${gasWithBuffer}, 最终=${finalGas}`);

      return '0x' + finalGas.toString(16);
    } catch (error) {
      console.error("估算gas失败:", error);
      // 如果估算失败，返回一个非常高的默认值，因为这是一个复杂的支付合约
      return '0x' + (800000).toString(16); // 设置一个非常高的gas limit
    }
  };

  // 检查用户余额是否足够支付交易
  const checkBalance = async (txParams: TransactionParams, gasLimit: string): Promise<boolean> => {
    try {
      // 获取当前gas价格
      const gasPrice = await window.ethereum.request({
        method: 'eth_gasPrice',
      });

      // 计算交易所需的总ETH（交易value + gas费用）
      const valueWei = txParams.value ? BigInt(txParams.value) : BigInt(0);
      const gasCostWei = BigInt(gasLimit) * BigInt(gasPrice);
      const totalRequired = valueWei + gasCostWei;

      // 获取用户余额
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [txParams.from, 'latest'],
      });

      const balanceWei = BigInt(balance);

      // 检查余额是否足够
      if (balanceWei < totalRequired) {
        setTxStatus(`余额不足: 需要 ${totalRequired.toString()} wei，但只有 ${balanceWei.toString()} wei`);
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
          tokenAddress,
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
        from: userAddress,
        to: transaction.to,
        data: transaction.data,
      };

      // 根据支付类型添加value
      if (decodedData.functionName === 'payWithNative') {
        txParams.value = transaction.value;
      } else {
        txParams.value = '0x0';
      }

      // 添加chainId（如果需要）
      if (transaction.chainId) {
        txParams.chainId = `0x${Number(transaction.chainId).toString(16)}`;
      }

      try {
        // 估算并添加足够的gas limit
        setTxStatus("正在估算交易所需的gas...");

        // 如果用户选择使用高gas，则直接使用自定义值
        if (useHighGas) {
          txParams.gas = '0x' + parseInt(customGasLimit).toString(16);
          setTxStatus(`使用自定义高gas限制: ${customGasLimit} 单位`);
        } else {
          txParams.gas = await estimateGas(txParams);
          setTxStatus(`估算gas完成: ${parseInt(txParams.gas as string, 16)} 单位`);
        }

        // 检查用户余额是否足够支付交易
        const balanceCheck = await checkBalance(txParams, txParams.gas);
        if (!balanceCheck) {
          setLoading(false);
          return;
        }

        // 获取当前gas价格并设置适当的值
        const gasPrice = await window.ethereum.request({
          method: 'eth_gasPrice',
        });

        // 将gas价格提高20%，确保交易能够快速被确认
        // 对于复杂合约，更高的gas价格可以帮助避免MetaMask的"extra fees"警告
        const gasPriceNum = BigInt(gasPrice);
        const adjustedGasPrice = gasPriceNum + (gasPriceNum * BigInt(20) / BigInt(100));

        // 对于EIP-1559兼容的网络，设置maxFeePerGas和maxPriorityFeePerGas
        // 检查网络是否支持EIP-1559
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const networkSupportsEIP1559 = [
          '0x1', // Ethereum Mainnet
          '0xaa36a7', // Sepolia
          '0x5', // Goerli
        ].includes(chainId);

        if (networkSupportsEIP1559) {
          // 设置EIP-1559参数，使用更高的值以确保交易成功
          txParams.maxFeePerGas = '0x' + adjustedGasPrice.toString(16);
          // 提高优先费用以确保矿工优先处理
          const priorityFee = gasPriceNum / BigInt(2);
          txParams.maxPriorityFeePerGas = '0x' + priorityFee.toString(16);
          setTxStatus(`使用EIP-1559 gas参数: maxFeePerGas=${adjustedGasPrice.toString()}, maxPriorityFeePerGas=${priorityFee.toString()}`);
        } else {
          // 对于不支持EIP-1559的网络，使用传统的gasPrice
          txParams.gasPrice = '0x' + adjustedGasPrice.toString(16);
          setTxStatus(`使用传统gas参数: gasPrice=${adjustedGasPrice.toString()}`);
        }

        // 添加手动设置的gas选项，让用户可以在MetaMask中调整
        const manualGasParams = {
          ...txParams,
          gas: txParams.gas
        };

        // 发送交易
        setTxStatus("正在发送支付交易...");
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [manualGasParams],
        });

        setTxStatus(`支付交易已发送: ${txHash}`);

        // 等待交易确认
        setTxStatus(`等待交易确认中...`);
        const receipt = await waitForTransaction(txHash);

        // 检查交易是否成功
        if (receipt && (receipt as any).status === '0x1') {
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
                使用自定义Gas限制（解决交易失败问题）
              </label>
            </div>

            {useHighGas && (
              <div className="ml-6">
                <label className="block mb-2 text-sm">Gas限制: </label>
                <input
                  type="text"
                  value={customGasLimit}
                  onChange={(e) => setCustomGasLimit(e.target.value)}
                  placeholder="输入Gas限制"
                  className="w-full p-2 border rounded"
                />
                <p className="text-xs text-gray-500 mt-1">
                  推荐值: 800,000 - 1,000,000（复杂合约可能需要更高的Gas限制）
                </p>
              </div>
            )}
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

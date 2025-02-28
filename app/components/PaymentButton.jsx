"use client";

import { useState } from "react";
import {
  createWalletClient,
  custom,
  parseEther,
  encodeFunctionData,
  createPublicClient,
  http,
  zeroAddress,
  parseAbi,
  getContract,
} from "viem";
import { mainnet } from "viem/chains";

export default function PaymentButton({ productId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);

  // 检查是否安装了MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("请安装MetaMask钱包");
      return null;
    }

    try {
      // 创建钱包客户端
      const walletClient = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum),
      });

      // 请求连接账户
      const accounts = await walletClient.requestAddresses();
      return { walletClient, account: accounts[0] };
    } catch (error) {
      setError("连接钱包失败");
      console.error(error);
      return null;
    }
  };

  // 获取ERC20代币授权
  const approveERC20 = async (
    tokenAddress,
    spenderAddress,
    amount,
    walletClient,
    account
  ) => {
    try {
      // ERC20合约ABI
      const erc20Abi = parseAbi([
        "function approve(address spender, uint256 amount) external returns (bool)",
      ]);

      // 创建合约实例
      const erc20Contract = getContract({
        address: tokenAddress,
        abi: erc20Abi,
        client: {
          public: createPublicClient({
            chain: mainnet,
            transport: http(),
          }),
          wallet: walletClient,
        },
      });

      // 发送授权交易
      const hash = await erc20Contract.write.approve([spenderAddress, amount], {
        account,
      });

      // 创建公共客户端来等待交易确认
      const publicClient = createPublicClient({
        chain: mainnet,
        transport: http(),
      });

      // 等待交易确认
      await publicClient.waitForTransactionReceipt({ hash });

      return true;
    } catch (error) {
      console.error("ERC20授权失败:", error);
      setError(`ERC20授权失败: ${error.message}`);
      return false;
    }
  };

  // 处理支付
  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      // 连接钱包
      const walletConnection = await connectWallet();
      if (!walletConnection) {
        setLoading(false);
        return;
      }

      const { walletClient, account } = walletConnection;

      // 调用API获取订单数据和签名
      const response = await fetch(`/api/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAddress: account,
          productId: productId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "获取订单数据失败");
      }

      const data = await response.json();

      // 获取交易数据
      const { transaction, product, paymentContractAddress } = data;

      // 如果是ERC20代币支付，需要先授权
      if (product.tokenAddress !== zeroAddress) {
        const approved = await approveERC20(
          product.tokenAddress,
          paymentContractAddress,
          BigInt(product.price),
          walletClient,
          account
        );

        if (!approved) {
          setLoading(false);
          return;
        }
      }

      // 创建公共客户端
      const publicClient = createPublicClient({
        chain: mainnet,
        transport: http(),
      });

      // 发送交易
      const hash = await walletClient.sendTransaction({
        account,
        to: transaction.to,
        data: transaction.data,
        value: transaction.value ? BigInt(transaction.value) : BigInt(0),
      });

      // 等待交易确认
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // 设置交易哈希
      setTxHash(receipt.transactionHash);

      console.log("支付成功:", receipt);
    } catch (error) {
      console.error("支付失败:", error);
      setError(`支付失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-button-container">
      <button
        onClick={handlePayment}
        disabled={loading}
        className="payment-button"
      >
        {loading ? "处理中..." : "立即支付"}
      </button>

      {error && <div className="error-message">{error}</div>}

      {txHash && (
        <div className="success-message">
          <p>支付成功!</p>
          <a
            href={`https://etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            在Etherscan上查看交易
          </a>
        </div>
      )}

      <style jsx>{`
        .payment-button-container {
          margin: 20px 0;
        }

        .payment-button {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .payment-button:hover {
          background-color: #2980b9;
        }

        .payment-button:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
        }

        .error-message {
          color: #e74c3c;
          margin-top: 10px;
        }

        .success-message {
          color: #2ecc71;
          margin-top: 10px;
        }

        .success-message a {
          color: #3498db;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

const { createPublicClient, http, parseAbiItem } = require("viem");
const { sepolia } = require("viem/chains");
const fetch = require("node-fetch");
const crypto = require("crypto");
require("dotenv").config();

// 支付合约地址
const PAYMENT_CONTRACT_ADDRESS = process.env.PAYMENT_CONTRACT_ADDRESS;

// API密钥和密钥 - 应该在.env文件中配置
const API_KEY = process.env.EVENT_LISTENER_API_KEY;
const API_SECRET = process.env.EVENT_LISTENER_API_SECRET;

if (!API_KEY || !API_SECRET) {
  console.error(
    "错误: 未配置API密钥或密钥。请在.env文件中设置EVENT_LISTENER_API_KEY和EVENT_LISTENER_API_SECRET"
  );
  process.exit(1);
}

// 创建公共客户端
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

// PaymentCompleted 事件的 ABI
const paymentCompletedEventAbi = parseAbiItem(
  "event PaymentCompleted(bytes32 indexed orderId)"
);

// 生成HMAC签名
function generateSignature(data, timestamp) {
  const payload = JSON.stringify(data) + timestamp;
  return crypto.createHmac("sha256", API_SECRET).update(payload).digest("hex");
}

// 更新订单状态的函数
async function updateOrderStatus(orderId, txHash) {
  try {
    console.log(`正在更新订单 ${orderId} 的状态...`);

    // 准备请求数据
    const requestData = {
      status: "completed",
      transactionHash: txHash,
    };

    // 生成时间戳和签名
    const timestamp = Date.now().toString();
    const signature = generateSignature(requestData, timestamp);

    // 调用 API 更新订单状态
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/orders/${orderId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
          "X-Timestamp": timestamp,
          "X-Signature": signature,
        },
        body: JSON.stringify(requestData),
      }
    );

    const data = await response.json();

    if (data.success) {
      console.log(`订单 ${orderId} 状态已更新为已完成`);
    } else {
      console.error(`更新订单状态失败:`, data.error);
    }
  } catch (error) {
    console.error(`更新订单状态时出错:`, error);
  }
}

// 开始监听合约事件
async function startEventListener() {
  console.log(`开始监听支付合约事件，合约地址: ${PAYMENT_CONTRACT_ADDRESS}`);

  // 使用 viem 的 watchContractEvent 方法监听事件
  const unwatch = publicClient.watchContractEvent({
    address: PAYMENT_CONTRACT_ADDRESS,
    event: paymentCompletedEventAbi,
    onLogs: (logs) => {
      for (const log of logs) {
        // 从事件日志中提取 orderId
        const orderId = log.args.orderId;
        const txHash = log.transactionHash;

        console.log(
          `检测到 PaymentCompleted 事件，订单ID: ${orderId}, 交易哈希: ${txHash}`
        );

        // 更新订单状态
        updateOrderStatus(orderId, txHash);
      }
    },
  });

  // 处理程序退出
  process.on("SIGINT", () => {
    console.log("停止监听合约事件...");
    unwatch();
    process.exit(0);
  });
}

// 启动监听器
startEventListener().catch((error) => {
  console.error("启动事件监听器时出错:", error);
  process.exit(1);
});

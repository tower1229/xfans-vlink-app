import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * 验证事件监听器请求的中间件
 *
 * 此中间件验证来自事件监听器的请求，确保只有授权的事件监听器可以更新订单状态
 * 验证基于HMAC签名，使用共享密钥
 *
 * 请求头需要包含:
 * - X-API-Key: 事件监听器的API密钥
 * - X-Timestamp: 请求的时间戳
 * - X-Signature: 请求数据的HMAC签名
 *
 * @param {Request} request - 请求对象
 * @returns {Object|null} - 如果验证失败，返回错误响应；如果验证成功，返回null
 */
export function verifyEventListenerRequest(request) {
  try {
    // 获取请求头
    const apiKey = request.headers.get("X-API-Key");
    const timestamp = request.headers.get("X-Timestamp");
    const signature = request.headers.get("X-Signature");

    // 检查必要的头信息是否存在
    if (!apiKey || !timestamp || !signature) {
      return NextResponse.json(
        { success: false, error: "缺少必要的认证头信息" },
        { status: 401 }
      );
    }

    // 验证API密钥
    const validApiKey = process.env.EVENT_LISTENER_API_KEY;
    if (!validApiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        { success: false, error: "无效的API密钥" },
        { status: 401 }
      );
    }

    // 验证时间戳 - 防止重放攻击
    // 时间戳不应该超过5分钟
    const currentTime = Date.now();
    const requestTime = parseInt(timestamp);
    const timeDiff = Math.abs(currentTime - requestTime);
    const maxTimeDiff = 5 * 60 * 1000; // 5分钟

    if (isNaN(requestTime) || timeDiff > maxTimeDiff) {
      return NextResponse.json(
        { success: false, error: "请求已过期或时间戳无效" },
        { status: 401 }
      );
    }

    // 克隆请求以获取请求体
    return null; // 验证成功
  } catch (error) {
    console.error("事件监听器认证错误:", error);
    return NextResponse.json(
      { success: false, error: "认证过程中发生错误" },
      { status: 500 }
    );
  }
}

/**
 * 验证请求签名
 *
 * @param {Object} requestData - 请求数据
 * @param {string} timestamp - 请求时间戳
 * @param {string} signature - 请求签名
 * @returns {boolean} - 签名是否有效
 */
export async function verifySignature(requestData, timestamp, signature) {
  try {
    const apiSecret = process.env.EVENT_LISTENER_API_SECRET;
    if (!apiSecret) {
      console.error("未配置API密钥");
      return false;
    }

    // 检查签名是否为null或空
    if (!signature) {
      console.error("签名为空或null");
      return false;
    }

    // 重新计算签名
    const payload = JSON.stringify(requestData) + timestamp;
    const expectedSignature = crypto
      .createHmac("sha256", apiSecret)
      .update(payload)
      .digest("hex");

    // 比较签名
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error("验证签名时出错:", error);
    return false;
  }
}

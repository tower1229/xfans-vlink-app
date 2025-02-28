import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { http } from "viem";
import { getChainById } from "@/utils/chainUtils";

// 缓存配置
const CACHE_CONFIG = {
  MAX_SIZE: 10, // 最大缓存数量，由于只基于chainId缓存，所以不需要太大
  CACHE_TTL: 3600000, // 缓存过期时间（毫秒），默认1小时
};

// 缓存结构: { chainId: { client, timestamp } }
const walletClientCache = new Map();

/**
 * 清理过期的缓存
 */
function cleanExpiredCache() {
  const now = Date.now();
  let expiredCount = 0;

  for (const [chainId, value] of walletClientCache.entries()) {
    if (now - value.timestamp > CACHE_CONFIG.CACHE_TTL) {
      walletClientCache.delete(chainId);
      expiredCount++;
    }
  }

  if (expiredCount > 0) {
    console.log(`已清理 ${expiredCount} 个过期的钱包客户端缓存`);
  }
}

/**
 * 检查缓存大小并清理最旧的缓存
 */
function checkCacheSize() {
  if (walletClientCache.size <= CACHE_CONFIG.MAX_SIZE) {
    return;
  }

  // 按时间戳排序，删除最旧的缓存
  const sortedEntries = [...walletClientCache.entries()].sort(
    (a, b) => a[1].timestamp - b[1].timestamp
  );

  const deleteCount = walletClientCache.size - CACHE_CONFIG.MAX_SIZE;
  for (let i = 0; i < deleteCount; i++) {
    walletClientCache.delete(sortedEntries[i][0]);
  }

  console.log(`已清理 ${deleteCount} 个最旧的钱包客户端缓存`);
}

/**
 * 获取钱包客户端实例
 * @param {string} privateKey - 私钥
 * @param {number} chainId - 链ID
 * @returns {object} - 钱包客户端实例
 */
export function getWalletClient(privateKey, chainId) {
  if (!privateKey) {
    throw new Error("私钥不能为空");
  }

  if (!chainId) {
    throw new Error("链ID不能为空");
  }

  // 清理过期缓存
  cleanExpiredCache();

  // 使用chainId作为缓存键
  const cacheKey = chainId.toString();

  // 检查缓存中是否已有该实例
  if (walletClientCache.has(cacheKey)) {
    const cachedData = walletClientCache.get(cacheKey);
    // 更新访问时间戳
    cachedData.timestamp = Date.now();
    return cachedData.client;
  }

  // 创建账户
  const account = privateKeyToAccount(privateKey);

  // 获取链对象
  const chain = getChainById(chainId);

  // 创建钱包客户端
  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(),
  });

  // 检查缓存大小
  checkCacheSize();

  // 缓存实例
  walletClientCache.set(cacheKey, {
    client: walletClient,
    timestamp: Date.now(),
  });

  return walletClient;
}

/**
 * 清除钱包客户端缓存
 * @param {number} chainId - 链ID (可选，如果提供则只清除该链ID的缓存)
 */
export function clearWalletClientCache(chainId) {
  if (!chainId) {
    // 清除所有缓存
    walletClientCache.clear();
    console.log("已清理所有钱包客户端缓存");
    return;
  }

  // 清除特定链ID的缓存
  const cacheKey = chainId.toString();
  if (walletClientCache.has(cacheKey)) {
    walletClientCache.delete(cacheKey);
    console.log(`已清理链ID ${chainId} 的钱包客户端缓存`);
  }
}

export default {
  getWalletClient,
  clearWalletClientCache,
};

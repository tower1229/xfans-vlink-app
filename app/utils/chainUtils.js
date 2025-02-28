import { mainnet, sepolia } from "viem/chains";

/**
 * 链ID到链对象的映射
 */
export const CHAIN_MAP = {
  1: mainnet, // 以太坊主网
  11155111: sepolia, // Sepolia测试网
};

/**
 * 获取所有支持的链ID列表
 * @returns {number[]} - 支持的链ID列表
 */
export function getSupportedChainIds() {
  return Object.keys(CHAIN_MAP).map((id) => parseInt(id, 10));
}

/**
 * 检查链ID是否受支持
 * @param {number} chainId - 要检查的链ID
 * @returns {boolean} - 是否支持该链ID
 */
export function isSupportedChain(chainId) {
  return !!CHAIN_MAP[chainId];
}

/**
 * 根据链ID获取对应的链对象
 * @param {number} chainId - 链ID
 * @returns {object} - 对应的链对象
 * @throws {Error} - 如果找不到对应的链，抛出错误
 */
export function getChainById(chainId) {
  const chain = CHAIN_MAP[chainId];

  if (!chain) {
    throw new Error(
      `不支持的链ID: ${chainId}。支持的链ID: ${getSupportedChainIds().join(
        ", "
      )}`
    );
  }

  return chain;
}

export default {
  CHAIN_MAP,
  getChainById,
  isSupportedChain,
  getSupportedChainIds,
};

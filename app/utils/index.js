// 导出所有工具函数
export * from "./orderUtils";
export * from "./chainUtils";
export * from "./walletUtils";

// 导出订单工具函数
export {
  generateOrderId,
  createOrder,
  getOrderById,
  updateOrderStatus,
  getActiveOrderByUserAndProduct,
  getOrdersByUser,
  getOrdersByProduct,
  updateExpiredOrders,
  createNewOrder,
} from "./orderUtils";

// 导出产品工具函数
export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  initSampleProducts,
  generateProductId,
} from "./productUtils";

// 导出链工具函数
export {
  isSupportedChain,
  getSupportedChainIds,
  getChainById,
} from "./chainUtils";

// 导出钱包工具函数
export { getWalletClient, clearWalletClientCache } from "./walletUtils";

// 导出数据库工具函数
export { executeQuery, initDatabase } from "./db";

// 导出数据库初始化函数
export async function initializeDatabase() {
  try {
    // Import the necessary functions
    const { initDatabase } = await import("./db");
    const { initSampleProducts } = await import("./productUtils");

    // 初始化数据库表
    await initDatabase();

    // 初始化示例产品数据
    await initSampleProducts();

    console.log("数据库初始化完成");
    return true;
  } catch (error) {
    console.error("数据库初始化失败:", error);
    return false;
  }
}

// 导出所有工具函数
export * from "./orderUtils";
export * from "./chainUtils";
export * from "./walletUtils";
export * from "./productUtils";
export * from "./userUtils";

// 导出数据库工具函数
export * from "./db";

// 导出数据库初始化函数
export async function initializeDatabase() {
  try {
    // Import the necessary functions
    const { initDatabase } = await import("./db");
    const { initSampleProducts } = await import("./productUtils");
    const { createAdminUserIfNotExists } = await import("./userUtils");

    // 初始化数据库表
    await initDatabase();

    // 初始化示例产品数据
    await initSampleProducts();

    // 创建默认管理员用户（如果不存在）
    await createAdminUserIfNotExists();

    console.log("数据库初始化完成");
    return true;
  } catch (error) {
    console.error("数据库初始化失败:", error);
    return false;
  }
}

export {
  getOrderById,
  createNewOrder,
  updateOrderStatus,
  getOrdersByUser,
  updateExpiredOrders,
  getAllOrders,
} from "./orderUtils";

export {
  createUser,
  getUserByUsername,
  getUserByEmail,
  getUserByWalletAddress,
  getUserById,
  verifyPassword,
  generateTokens,
  saveRefreshToken,
  verifyRefreshToken,
  deleteRefreshToken,
  verifyJwtToken,
  updateUser,
  deleteUser,
} from "./userUtils";

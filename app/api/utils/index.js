// 导出所有工具函数
export * from "./orderUtils";
export * from "./postUtils";
export * from "./userUtils";

// 导出数据库工具函数
export * from "./prismaDb";

// 导出数据库初始化函数
export async function initializeDatabase() {
  try {
    // Import the necessary functions
    const { initDatabase } = await import("./prismaDb");
    const { createAdminUserIfNotExists } = await import("./userUtils");

    // 初始化数据库表
    await initDatabase();

    // 导入并初始化示例数据
    const { initSamplePosts } = await import("./postUtils");

    // 初始化示例数据
    await initSamplePosts();

    // 创建默认管理员用户（如果不存在）
    await createAdminUserIfNotExists();

    console.log("数据库初始化完成");
    return { success: true };
  } catch (error) {
    console.error("数据库初始化失败:", error);
    return { success: false, error: error.message };
  }
}

// 导出验证相关函数
export * from "./validation";

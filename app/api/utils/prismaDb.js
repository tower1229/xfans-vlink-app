import { db } from "../lib/db";
import { PrismaClient } from "@prisma/client";

/**
 * 初始化数据库
 * 注意：表结构应该通过迁移管理，而不是直接通过SQL命令
 */
export async function initDatabase() {
  try {
    // 尝试一个简单的查询来检查数据库连接
    await db.user.findFirst();
    console.log("数据库连接成功");
    return true;
  } catch (error) {
    console.error("数据库初始化失败:", error);
    return false;
  }
}

// 导出 Prisma 客户端实例，以便在需要时可以直接使用
export { PrismaClient };

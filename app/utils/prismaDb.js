import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * 初始化数据库表 - Prisma版本
 * 注意：使用Prisma时，表结构通常通过迁移来管理，而不是代码中的CREATE TABLE
 */
export async function initDatabase() {
  try {
    console.log(
      "使用Prisma时，表结构应通过迁移来管理，而不是代码中的CREATE TABLE"
    );
    console.log("请使用 'npx prisma migrate dev' 来创建和更新数据库结构");

    // 这里我们不再执行CREATE TABLE语句
    // 如果需要检查连接，可以执行一个简单的查询
    await db.$queryRaw`SELECT 1`;

    console.log("数据库连接成功");
    return true;
  } catch (error) {
    console.error("数据库连接失败:", error);
    throw error;
  }
}

export { db, initDatabase };

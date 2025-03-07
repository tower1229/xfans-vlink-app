import { PrismaClient } from "@prisma/client";

// 使用 app/api/prisma/schema.prisma 作为 Prisma 模型定义
// 防止开发环境中创建多个 Prisma 实例
const globalForPrisma = global;

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

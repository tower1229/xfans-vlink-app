import { neon } from "@neondatabase/serverless";

// 创建数据库连接
// 使用最新的推荐方式创建连接
const sql = neon(process.env.DATABASE_URL, {
  fetchOptions: {
    cache: "no-store",
  },
});

/**
 * 执行SQL查询
 * @param {string|TemplateStringsArray} query - SQL查询语句或模板字符串
 * @param {Array} params - 查询参数
 * @returns {Promise} - 查询结果
 */
export async function executeQuery(query, ...params) {
  try {
    // 如果是模板字符串调用，直接传递给sql函数
    if (Array.isArray(query) && query.raw) {
      return await sql(query, ...params);
    }

    // 如果是普通字符串和参数数组，按原来的方式处理
    return await sql(query, params[0] || []);
  } catch (error) {
    console.error("数据库查询错误:", error);

    // 检查是否是连接错误
    if (
      error.message &&
      (error.message.includes("fetch failed") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("connection") ||
        error.message.includes("timeout"))
    ) {
      throw new Error(`Error connecting to database: ${error.message}`);
    }

    throw new Error(`数据库查询失败: ${error.message}`);
  }
}

/**
 * 初始化数据库表
 */
export async function initDatabase() {
  try {
    // 创建产品表
    await executeQuery`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        image VARCHAR(255) NOT NULL,
        price VARCHAR(255) NOT NULL,
        token_address VARCHAR(255) NOT NULL,
        chain_id INTEGER NOT NULL,
        owner_address VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 创建订单表
    await executeQuery`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        user_address VARCHAR(255) NOT NULL,
        price VARCHAR(255) NOT NULL,
        token_address VARCHAR(255) NOT NULL,
        owner_address VARCHAR(255) NOT NULL,
        chain_id INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        signature TEXT,
        transaction_hash VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `;

    console.log("数据库表初始化成功");
  } catch (error) {
    console.error("数据库表初始化失败:", error);
    throw error;
  }
}

export default {
  sql,
  executeQuery,
  initDatabase,
};

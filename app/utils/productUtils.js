import { parseEther, zeroAddress } from "viem";
import { executeQuery } from "./db";

/**
 * 生成唯一的产品ID
 * @returns {string} 生成的产品ID
 */
export function generateProductId() {
  // 创建时间戳和随机数，确保产品ID的唯一性
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000000);

  // 使用 'prod' 前缀，后跟时间戳和随机数的组合
  return `prod_${timestamp.toString(36)}_${randomNum.toString(36)}`;
}

/**
 * 获取所有产品
 * @returns {Promise<Array>} 产品列表
 */
export async function getAllProducts() {
  try {
    const rows =
      await executeQuery`SELECT * FROM products ORDER BY created_at DESC`;
    return rows.map(formatProductFromDb);
  } catch (error) {
    console.error("获取产品列表失败:", error);
    throw new Error(`获取产品列表失败: ${error.message}`);
  }
}

/**
 * 根据ID获取产品
 * @param {string} productId 产品ID
 * @returns {Promise<Object|null>} 产品对象或null
 */
export async function getProductById(productId) {
  try {
    console.log(`查询产品: ${productId}`);

    const rows =
      await executeQuery`SELECT * FROM products WHERE id = ${productId}`;

    console.log(`查询结果: ${rows.length} 行`);

    if (rows.length === 0) {
      return null;
    }
    return formatProductFromDb(rows[0]);
  } catch (error) {
    console.error(`获取产品 ${productId} 失败:`, error);
    throw new Error(`获取产品失败: ${error.message}`);
  }
}

/**
 * 创建产品
 * @param {Object} product 产品对象
 * @returns {Promise<Object>} 创建的产品
 */
export async function createProduct(product) {
  try {
    // 如果没有提供ID，则生成一个
    const productId = product.id || generateProductId();

    const rows = await executeQuery`
      INSERT INTO products (
        id, title, image, price, token_address, chain_id, owner_address
      ) VALUES (
        ${productId},
        ${product.title},
        ${product.image},
        ${product.price.toString()},
        ${product.tokenAddress},
        ${product.chainId},
        ${product.ownerAddress}
      )
      RETURNING *
    `;
    return formatProductFromDb(rows[0]);
  } catch (error) {
    console.error("创建产品失败:", error);
    throw new Error(`创建产品失败: ${error.message}`);
  }
}

/**
 * 更新产品
 * @param {string} productId 产品ID
 * @param {Object} updates 更新内容
 * @returns {Promise<Object>} 更新后的产品
 */
export async function updateProduct(productId, updates) {
  try {
    // 构建动态更新字段
    const updateFields = [];
    const values = [productId];
    let updateQuery = "UPDATE products SET ";

    Object.entries(updates).forEach(([key, value], index) => {
      // 转换驼峰命名为下划线命名
      const dbField = key.replace(/([A-Z])/g, "_$1").toLowerCase();

      // 特殊处理price字段
      if (key === "price" && typeof value === "bigint") {
        value = value.toString();
      }

      updateFields.push(`${dbField} = $${index + 2}`);
      values.push(value);
    });

    updateQuery +=
      updateFields.join(", ") +
      ", updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *";

    const rows = await executeQuery(updateQuery, values);
    return formatProductFromDb(rows[0]);
  } catch (error) {
    console.error(`更新产品 ${productId} 失败:`, error);
    throw new Error(`更新产品失败: ${error.message}`);
  }
}

/**
 * 删除产品
 * @param {string} productId 产品ID
 * @returns {Promise<boolean>} 是否成功删除
 */
export async function deleteProduct(productId) {
  try {
    // 先检查是否有订单引用了该产品
    const orders = await executeQuery`
      SELECT id FROM orders WHERE product_id = ${productId}
    `;

    // 如果有订单引用了该产品，则先删除这些订单
    if (orders && orders.length > 0) {
      await executeQuery`
        DELETE FROM orders WHERE product_id = ${productId}
      `;
    }

    // 使用RETURNING子句来获取被删除的行
    const result = await executeQuery`
      DELETE FROM products WHERE id = ${productId} RETURNING id
    `;

    // 检查是否有行被删除
    return result && Array.isArray(result) && result.length > 0;
  } catch (error) {
    console.error(`删除产品 ${productId} 失败:`, error);
    throw new Error(`删除产品失败: ${error.message}`);
  }
}

/**
 * 初始化示例产品数据
 */
export async function initSampleProducts() {
  try {
    // 检查是否已有产品数据
    const rows = await executeQuery`SELECT COUNT(*) FROM products`;
    if (parseInt(rows[0].count) > 0) {
      console.log("产品数据已存在，跳过初始化");
      return;
    }

    // 示例产品数据
    const sampleProducts = [
      {
        id: "prod001",
        title: "高级会员订阅",
        image: "https://example.com/images/premium.jpg",
        price: parseEther("0.01"), // 0.01 ETH
        tokenAddress: zeroAddress, // 原生代币
        chainId: 11155111,
        ownerAddress: "0x123456789012345678901234567890123456789A",
      },
      {
        id: "prod002",
        title: "数字艺术品#1",
        image: "https://example.com/images/art1.jpg",
        price: parseEther("50"), // 50 USDT
        tokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT合约地址
        chainId: 11155111,
        ownerAddress: "0x123456789012345678901234567890123456789A",
      },
      {
        id: "prod003",
        title: "在线课程",
        image: "https://example.com/images/course.jpg",
        price: parseEther("100"), // 100 USDC
        tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC合约地址
        chainId: 11155111,
        ownerAddress: "0x123456789012345678901234567890123456789A",
      },
    ];

    // 插入示例产品数据
    for (const product of sampleProducts) {
      await createProduct(product);
    }

    console.log("示例产品数据初始化成功");
  } catch (error) {
    console.error("初始化示例产品数据失败:", error);
    throw error;
  }
}

/**
 * 格式化数据库中的产品数据
 * @param {Object} dbProduct 数据库中的产品数据
 * @returns {Object} 格式化后的产品数据
 */
function formatProductFromDb(dbProduct) {
  return {
    id: dbProduct.id,
    title: dbProduct.title,
    image: dbProduct.image,
    price: BigInt(dbProduct.price), // 转换为BigInt
    tokenAddress: dbProduct.token_address,
    chainId: dbProduct.chain_id,
    ownerAddress: dbProduct.owner_address,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
  };
}

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  initSampleProducts,
};

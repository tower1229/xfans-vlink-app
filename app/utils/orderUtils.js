import { keccak256, encodePacked } from "viem";
// Remove the circular import
// import { generateOrderId } from "@/utils";
import { executeQuery } from "./db";

/**
 * 生成唯一的订单ID
 * @param {string} productId - 产品ID
 * @param {string} userAddress - 用户钱包地址
 * @returns {string} - 生成的订单ID (bytes32 哈希值)
 */
export function generateOrderId(productId, userAddress) {
  // 创建时间戳和随机数，确保订单ID的唯一性
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000000);

  // 将产品ID、时间戳、用户地址和随机数打包编码
  const orderIdInput = encodePacked(
    ["string", "uint256", "address", "uint256"],
    [productId, BigInt(timestamp), userAddress, BigInt(randomNum)]
  );

  // 计算哈希值作为订单ID
  const orderId = keccak256(orderIdInput);

  return {
    orderId,
    timestamp,
  };
}

/**
 * 创建订单
 * @param {Object} orderData 订单数据
 * @returns {Promise<Object>} 创建的订单
 */
export async function createOrder(orderData) {
  try {
    const rows = await executeQuery`
      INSERT INTO orders (
        id,
        product_id,
        user_address,
        price,
        token_address,
        owner_address,
        chain_id,
        status,
        signature,
        expires_at
      ) VALUES (
        ${orderData.id},
        ${orderData.productId},
        ${orderData.userAddress},
        ${orderData.price.toString()},
        ${orderData.tokenAddress},
        ${orderData.ownerAddress},
        ${orderData.chainId},
        ${orderData.status || "pending"},
        ${orderData.signature || null},
        ${orderData.expiresAt}
      )
      RETURNING *
    `;
    return formatOrderFromDb(rows[0]);
  } catch (error) {
    console.error("创建订单失败:", error);
    throw new Error(`创建订单失败: ${error.message}`);
  }
}

/**
 * 根据ID获取订单
 * @param {string} orderId 订单ID
 * @returns {Promise<Object|null>} 订单对象或null
 */
export async function getOrderById(orderId) {
  try {
    const rows = await executeQuery`SELECT * FROM orders WHERE id = ${orderId}`;
    if (rows.length === 0) {
      return null;
    }
    return formatOrderFromDb(rows[0]);
  } catch (error) {
    console.error(`获取订单 ${orderId} 失败:`, error);
    throw new Error(`获取订单失败: ${error.message}`);
  }
}

/**
 * 更新订单状态
 * @param {string} orderId 订单ID
 * @param {string} status 新状态
 * @param {Object} additionalData 额外数据
 * @returns {Promise<Object>} 更新后的订单
 */
export async function updateOrderStatus(orderId, status, additionalData = {}) {
  try {
    // 构建动态更新字段
    const updateFields = [];
    const values = [status, orderId];
    let updateQuery = "UPDATE orders SET status = $1";
    let paramIndex = 2;

    // 处理额外数据
    Object.entries(additionalData).forEach(([key, value]) => {
      // 转换驼峰命名为下划线命名
      const dbField = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      updateFields.push(`${dbField} = $${paramIndex + 1}`);
      values.splice(paramIndex, 0, value);
      paramIndex++;
    });

    if (updateFields.length > 0) {
      updateQuery += ", " + updateFields.join(", ");
    }

    updateQuery += " WHERE id = $2 RETURNING *";

    const rows = await executeQuery(updateQuery, values);
    return formatOrderFromDb(rows[0]);
  } catch (error) {
    console.error(`更新订单 ${orderId} 状态失败:`, error);
    throw new Error(`更新订单状态失败: ${error.message}`);
  }
}

/**
 * 获取用户的活跃订单
 * @param {string} userAddress 用户地址
 * @param {string} productId 产品ID
 * @returns {Promise<Object|null>} 活跃订单或null
 */
export async function getActiveOrderByUserAndProduct(userAddress, productId) {
  try {
    const rows = await executeQuery`
      SELECT * FROM orders
      WHERE user_address = ${userAddress}
      AND product_id = ${productId}
      AND status = 'pending'
      AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (rows.length === 0) {
      return null;
    }

    return formatOrderFromDb(rows[0]);
  } catch (error) {
    console.error(
      `获取用户 ${userAddress} 产品 ${productId} 的活跃订单失败:`,
      error
    );
    throw new Error(`获取活跃订单失败: ${error.message}`);
  }
}

/**
 * 获取用户的所有订单
 * @param {string} userAddress 用户地址
 * @returns {Promise<Array>} 订单列表
 */
export async function getOrdersByUser(userAddress) {
  try {
    const rows = await executeQuery`
      SELECT * FROM orders
      WHERE user_address = ${userAddress}
      ORDER BY created_at DESC
    `;
    return rows.map(formatOrderFromDb);
  } catch (error) {
    console.error(`获取用户 ${userAddress} 的订单列表失败:`, error);
    throw new Error(`获取用户订单列表失败: ${error.message}`);
  }
}

/**
 * 获取产品的所有订单
 * @param {string} productId 产品ID
 * @returns {Promise<Array>} 订单列表
 */
export async function getOrdersByProduct(productId) {
  try {
    const rows = await executeQuery`
      SELECT * FROM orders
      WHERE product_id = ${productId}
      ORDER BY created_at DESC
    `;
    return rows.map(formatOrderFromDb);
  } catch (error) {
    console.error(`获取产品 ${productId} 的订单列表失败:`, error);
    throw new Error(`获取产品订单列表失败: ${error.message}`);
  }
}

/**
 * 更新过期订单状态
 * @returns {Promise<number>} 更新的订单数量
 */
export async function updateExpiredOrders() {
  try {
    const result = await executeQuery`
      UPDATE orders
      SET status = 'expired'
      WHERE status = 'pending'
      AND expires_at < NOW()
    `;
    return result.count || 0;
  } catch (error) {
    console.error("更新过期订单状态失败:", error);
    throw new Error(`更新过期订单状态失败: ${error.message}`);
  }
}

/**
 * 创建新订单并处理订单时效性
 * @param {string} productId 产品ID
 * @param {string} userAddress 用户地址
 * @param {Object} product 产品对象
 * @returns {Promise<Object>} 创建的订单
 */
export async function createNewOrder(productId, userAddress, product) {
  try {
    // 先更新所有过期订单
    await updateExpiredOrders();

    // 检查用户是否有活跃订单
    const activeOrder = await getActiveOrderByUserAndProduct(
      userAddress,
      productId
    );
    if (activeOrder) {
      throw new Error("您已有一个活跃的订单，请先完成支付或等待订单过期");
    }

    // 生成订单ID和过期时间
    const { orderId, timestamp } = generateOrderId(productId, userAddress);
    const expiresAt = new Date(timestamp + 3600000); // 1小时后过期

    // 创建新订单
    const orderData = {
      id: orderId,
      productId,
      userAddress,
      price: product.price,
      tokenAddress: product.tokenAddress,
      ownerAddress: product.ownerAddress,
      chainId: product.chainId,
      status: "pending",
      expiresAt,
    };

    return await createOrder(orderData);
  } catch (error) {
    console.error("创建新订单失败:", error);
    throw error;
  }
}

/**
 * 格式化数据库中的订单数据
 * @param {Object} dbOrder 数据库中的订单数据
 * @returns {Object} 格式化后的订单数据
 */
function formatOrderFromDb(dbOrder) {
  return {
    id: dbOrder.id,
    productId: dbOrder.product_id,
    userAddress: dbOrder.user_address,
    price: BigInt(dbOrder.price), // 转换为BigInt
    tokenAddress: dbOrder.token_address,
    ownerAddress: dbOrder.owner_address,
    chainId: dbOrder.chain_id,
    status: dbOrder.status,
    signature: dbOrder.signature,
    transactionHash: dbOrder.transaction_hash,
    createdAt: dbOrder.created_at,
    expiresAt: dbOrder.expires_at,
  };
}

export default {
  generateOrderId,
  createOrder,
  getOrderById,
  updateOrderStatus,
  getActiveOrderByUserAndProduct,
  getOrdersByUser,
  getOrdersByProduct,
  updateExpiredOrders,
  createNewOrder,
};

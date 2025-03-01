import { executeQuery } from "./db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// JWT密钥，应该从环境变量中获取
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d"; // 7天

/**
 * 创建新用户
 * @param {Object} userData 用户数据
 * @returns {Promise<Object>} 创建的用户
 */
export async function createUser(userData) {
  try {
    const {
      username,
      email,
      password,
      walletAddress,
      role = "user",
    } = userData;

    // 检查用户名是否已存在
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      throw new Error("用户名已存在");
    }

    // 检查邮箱是否已存在
    if (email) {
      const existingEmail = await getUserByEmail(email);
      if (existingEmail) {
        throw new Error("邮箱已存在");
      }
    }

    // 检查钱包地址是否已存在
    if (walletAddress) {
      const existingWallet = await getUserByWalletAddress(walletAddress);
      if (existingWallet) {
        throw new Error("钱包地址已关联其他账户");
      }
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 插入用户数据
    const query = `
      INSERT INTO users (username, email, password_hash, wallet_address, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, wallet_address, role, created_at
    `;
    const params = [username, email, passwordHash, walletAddress, role];
    const result = await executeQuery(query, params);

    return result[0];
  } catch (error) {
    console.error("创建用户失败:", error);
    throw error;
  }
}

/**
 * 根据用户名获取用户
 * @param {string} username 用户名
 * @returns {Promise<Object|null>} 用户对象或null
 */
export async function getUserByUsername(username) {
  try {
    const query = `
      SELECT id, username, email, password_hash, wallet_address, role, created_at, updated_at
      FROM users
      WHERE username = $1
    `;
    const result = await executeQuery(query, [username]);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("获取用户失败:", error);
    throw error;
  }
}

/**
 * 根据邮箱获取用户
 * @param {string} email 邮箱
 * @returns {Promise<Object|null>} 用户对象或null
 */
export async function getUserByEmail(email) {
  try {
    const query = `
      SELECT id, username, email, password_hash, wallet_address, role, created_at, updated_at
      FROM users
      WHERE email = $1
    `;
    const result = await executeQuery(query, [email]);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("获取用户失败:", error);
    throw error;
  }
}

/**
 * 根据钱包地址获取用户
 * @param {string} walletAddress 钱包地址
 * @returns {Promise<Object|null>} 用户对象或null
 */
export async function getUserByWalletAddress(walletAddress) {
  try {
    const query = `
      SELECT id, username, email, password_hash, wallet_address, role, created_at, updated_at
      FROM users
      WHERE wallet_address = $1
    `;
    const result = await executeQuery(query, [walletAddress]);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("获取用户失败:", error);
    throw error;
  }
}

/**
 * 根据ID获取用户
 * @param {number} id 用户ID
 * @returns {Promise<Object|null>} 用户对象或null
 */
export async function getUserById(id) {
  try {
    const query = `
      SELECT id, username, email, wallet_address, role, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    const result = await executeQuery(query, [id]);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("获取用户失败:", error);
    throw error;
  }
}

/**
 * 验证用户密码
 * @param {string} password 明文密码
 * @param {string} passwordHash 密码哈希
 * @returns {Promise<boolean>} 密码是否匹配
 */
export async function verifyPassword(password, passwordHash) {
  return await bcrypt.compare(password, passwordHash);
}

/**
 * 生成JWT令牌
 * @param {Object} user 用户对象
 * @returns {Object} 包含访问令牌和刷新令牌的对象
 */
export function generateTokens(user) {
  // 创建访问令牌
  const accessToken = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role,
      walletAddress: user.wallet_address,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  // 创建刷新令牌
  const refreshToken = crypto.randomBytes(40).toString("hex");

  return {
    accessToken,
    refreshToken,
  };
}

/**
 * 保存刷新令牌
 * @param {number} userId 用户ID
 * @param {string} refreshToken 刷新令牌
 * @returns {Promise<void>}
 */
export async function saveRefreshToken(userId, refreshToken) {
  try {
    // 计算过期时间
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7天后过期

    const query = `
      INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
    `;
    await executeQuery(query, [userId, refreshToken, expiresAt]);
  } catch (error) {
    console.error("保存刷新令牌失败:", error);
    throw error;
  }
}

/**
 * 验证刷新令牌
 * @param {string} refreshToken 刷新令牌
 * @returns {Promise<Object|null>} 用户对象或null
 */
export async function verifyRefreshToken(refreshToken) {
  try {
    const query = `
      SELECT rt.user_id, rt.expires_at, u.username, u.role, u.wallet_address
      FROM refresh_tokens rt
      JOIN users u ON rt.user_id = u.id
      WHERE rt.token = $1 AND rt.expires_at > NOW()
    `;
    const result = await executeQuery(query, [refreshToken]);

    if (result.length === 0) {
      return null;
    }

    return {
      id: result[0].user_id,
      username: result[0].username,
      role: result[0].role,
      wallet_address: result[0].wallet_address,
    };
  } catch (error) {
    console.error("验证刷新令牌失败:", error);
    throw error;
  }
}

/**
 * 删除刷新令牌
 * @param {string} refreshToken 刷新令牌
 * @returns {Promise<void>}
 */
export async function deleteRefreshToken(refreshToken) {
  try {
    const query = `
      DELETE FROM refresh_tokens
      WHERE token = $1
    `;
    await executeQuery(query, [refreshToken]);
  } catch (error) {
    console.error("删除刷新令牌失败:", error);
    throw error;
  }
}

/**
 * 验证JWT令牌
 * @param {string} token JWT令牌
 * @returns {Object|null} 解码后的令牌或null
 */
export function verifyJwtToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("验证JWT令牌失败:", error);
    return null;
  }
}

/**
 * 更新用户信息
 * @param {number} userId 用户ID
 * @param {Object} userData 用户数据
 * @returns {Promise<Object>} 更新后的用户
 */
export async function updateUser(userId, userData) {
  try {
    const { username, email, password, walletAddress, role } = userData;
    const updates = [];
    const params = [];
    let paramIndex = 1;

    // 构建更新语句
    if (username) {
      updates.push(`username = $${paramIndex++}`);
      params.push(username);
    }

    if (email) {
      updates.push(`email = $${paramIndex++}`);
      params.push(email);
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      updates.push(`password_hash = $${paramIndex++}`);
      params.push(passwordHash);
    }

    if (walletAddress) {
      updates.push(`wallet_address = $${paramIndex++}`);
      params.push(walletAddress);
    }

    if (role) {
      updates.push(`role = $${paramIndex++}`);
      params.push(role);
    }

    updates.push(`updated_at = NOW()`);

    // 如果没有要更新的字段，直接返回用户
    if (params.length === 0) {
      return await getUserById(userId);
    }

    // 添加用户ID
    params.push(userId);

    const query = `
      UPDATE users
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, username, email, wallet_address, role, created_at, updated_at
    `;
    const result = await executeQuery(query, params);

    return result[0];
  } catch (error) {
    console.error("更新用户失败:", error);
    throw error;
  }
}

/**
 * 删除用户
 * @param {number} userId 用户ID
 * @returns {Promise<boolean>} 是否成功删除
 */
export async function deleteUser(userId) {
  try {
    const query = `
      DELETE FROM users
      WHERE id = $1
      RETURNING id
    `;
    const result = await executeQuery(query, [userId]);
    return result.length > 0;
  } catch (error) {
    console.error("删除用户失败:", error);
    throw error;
  }
}

/**
 * 创建管理员用户（如果不存在）
 * @returns {Promise<void>}
 */
export async function createAdminUserIfNotExists() {
  try {
    // 检查是否已存在管理员用户
    const query = `
      SELECT COUNT(*) as count
      FROM users
      WHERE role = 'admin'
    `;
    const result = await executeQuery(query);
    const adminCount = parseInt(result[0].count);

    if (adminCount === 0) {
      // 从环境变量获取管理员凭据
      const adminUsername = process.env.ADMIN_USERNAME || "admin";
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
      const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";

      // 创建管理员用户
      await createUser({
        username: adminUsername,
        email: adminEmail,
        password: adminPassword,
        role: "admin",
      });

      console.log("已创建默认管理员用户");
    }
  } catch (error) {
    console.error("创建管理员用户失败:", error);
    throw error;
  }
}

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// JWT密钥，应该从环境变量中获取
const JWT_SECRET = "your_jwt_secret_key_here"; // 使用固定的密钥，确保与客户端使用的密钥一致
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

    // 生成唯一ID
    const id = uuidv4();

    // 使用Prisma创建用户
    const newUser = await db.user.create({
      data: {
        id,
        username,
        email,
        password: passwordHash,
        address: walletAddress,
        role,
      },
      select: {
        id: true,
        username: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    // 转换为与旧代码兼容的格式
    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      wallet_address: newUser.address,
      role: newUser.role,
      created_at: newUser.createdAt,
    };
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
    // 使用Prisma的原生查询方法
    const user = await db.user.findUnique({
      where: {
        username: username,
      },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return null;

    // 转换为与旧代码兼容的格式
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password_hash: user.password,
      wallet_address: user.address,
      role: user.role,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
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
    // 如果email为空，直接返回null
    if (!email) return null;

    // 使用Prisma的原生查询方法
    const user = await db.user.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return null;

    // 转换为与旧代码兼容的格式
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password_hash: user.password,
      wallet_address: user.address,
      role: user.role,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
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
    // 使用Prisma的原生查询方法
    const user = await db.user.findFirst({
      where: {
        address: walletAddress,
      },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return null;

    // 转换为与旧代码兼容的格式
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password_hash: user.password,
      wallet_address: user.address,
      role: user.role,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
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
    // 使用Prisma的原生查询方法
    const user = await db.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        username: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return null;

    // 转换为与旧代码兼容的格式
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      wallet_address: user.address,
      role: user.role,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
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

    // 使用Prisma创建刷新令牌
    await db.refreshToken.create({
      data: {
        userId: userId,
        token: refreshToken,
        expiresAt: expiresAt,
      },
    });
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
    // 使用Prisma查询刷新令牌
    const token = await db.refreshToken.findFirst({
      where: {
        token: refreshToken,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            address: true,
          },
        },
      },
    });

    if (!token) {
      return null;
    }

    return {
      id: token.user.id,
      username: token.user.username,
      role: token.user.role,
      wallet_address: token.user.address,
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
    // 使用Prisma删除刷新令牌
    await db.refreshToken.deleteMany({
      where: {
        token: refreshToken,
      },
    });
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
    console.log("验证JWT令牌:", token.substring(0, 10) + "...");
    console.log("使用的JWT密钥:", JWT_SECRET);
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("JWT令牌验证成功:", decoded);

    // 确保返回的用户信息包含walletAddress字段
    if (decoded && decoded.address && !decoded.walletAddress) {
      decoded.walletAddress = decoded.address;
    }

    return decoded;
  } catch (error) {
    console.error("验证JWT令牌失败:", error.name, error.message);
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
    const updateData = {};

    // 构建更新数据
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (walletAddress) updateData.address = walletAddress;
    if (role) updateData.role = role;

    // 如果有密码，加密后再更新
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // 如果没有要更新的字段，直接返回用户
    if (Object.keys(updateData).length === 0) {
      return await getUserById(userId);
    }

    // 使用Prisma更新用户
    const updatedUser = await db.user.update({
      where: {
        id: userId,
      },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 转换为与旧代码兼容的格式
    return {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      wallet_address: updatedUser.address,
      role: updatedUser.role,
      created_at: updatedUser.createdAt,
      updated_at: updatedUser.updatedAt,
    };
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
    // 使用Prisma删除用户
    const deletedUser = await db.user.delete({
      where: {
        id: userId,
      },
    });

    return !!deletedUser;
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
    const adminCount = await db.user.count({
      where: {
        role: "admin",
      },
    });

    if (adminCount === 0) {
      // 从环境变量获取管理员凭据
      const adminUsername = process.env.ADMIN_USERNAME || "admin";
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
      const adminEmail = process.env.ADMIN_EMAIL;

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

/**
 * 清理过期的刷新令牌
 * @returns {Promise<number>} 清理的令牌数量
 */
export async function cleanupExpiredRefreshTokens() {
  try {
    const result = await db.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log(`已清理 ${result.count} 个过期的刷新令牌`);
    return result.count;
  } catch (error) {
    console.error("清理过期刷新令牌失败:", error);
    throw error;
  }
}

/**
 * 根据ID检查用户是否存在
 * @param {string} userId 用户ID
 * @returns {Promise<boolean>} 用户是否存在
 */
export async function checkUserExists(userId) {
  try {
    if (!userId) return false;

    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    return !!user;
  } catch (error) {
    console.error(`检查用户 ${userId} 是否存在失败:`, error);
    return false;
  }
}

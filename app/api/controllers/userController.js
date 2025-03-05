import { NextResponse } from "next/server";
import {
  createUser,
  getUserByEmail,
  getUserByUsername,
  getUserByWalletAddress,
  verifyPassword,
  generateTokens,
  saveRefreshToken,
  verifyRefreshToken,
  deleteRefreshToken,
  updateUser,
  getUserById,
  deleteUser,
  verifyJwtToken,
} from "../utils/userUtils";
import {
  validateEmail,
  validateUsername,
  validatePassword,
  createErrorResponse,
  createSuccessResponse,
} from "../utils/validation";
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from "../middleware/errorHandler";
import { validateData, createServerErrorResponse } from "../utils/validation";
import { redis, cacheUtils } from "../utils/redis.mjs";

/**
 * 用户注册
 * @param {Request} request 请求对象
 * @param {Object} data 用户数据
 * @returns {Promise<Response>} 响应对象
 */
export async function registerController(request, data) {
  try {
    // 创建用户
    const user = await createUser(data);

    // 生成令牌
    const { accessToken, refreshToken } = await generateTokens(user);

    // 保存刷新令牌
    await saveRefreshToken(user.id, refreshToken);

    // 返回用户信息和令牌
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          walletAddress: user.wallet_address,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    if (error.message.includes("已存在")) {
      throw new ValidationError(error.message);
    }
    throw error;
  }
}

/**
 * 用户登录
 * @param {Request} request 请求对象
 * @param {Object} data 登录数据
 * @returns {Promise<Response>} 响应对象
 */
export async function loginController(request, data) {
  const { username, password } = data;

  // 获取用户
  const user = await getUserByUsername(username);
  if (!user) {
    throw new NotFoundError("用户不存在");
  }

  // 验证密码
  const isPasswordValid = await verifyPassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new UnauthorizedError("密码错误");
  }

  // 生成令牌
  const { accessToken, refreshToken } = await generateTokens(user);

  // 保存刷新令牌
  await saveRefreshToken(user.id, refreshToken);

  // 返回用户信息和令牌
  return NextResponse.json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        walletAddress: user.wallet_address,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
}

/**
 * 刷新访问令牌
 * @param {Request} request 请求对象
 * @param {Object} data 请求数据
 * @returns {Promise<Response>} 响应对象
 */
export async function refreshTokenController(request, data) {
  try {
    const { refreshToken } = data;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "REFRESH_TOKEN_REQUIRED",
            message: "刷新令牌是必需的",
          },
        },
        { status: 400 }
      );
    }

    // 验证刷新令牌
    const user = await verifyRefreshToken(refreshToken);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REFRESH_TOKEN",
            message: "无效或过期的刷新令牌",
          },
        },
        { status: 401 }
      );
    }

    // 删除旧的刷新令牌
    await deleteRefreshToken(refreshToken);

    // 生成新的令牌
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      user
    );

    // 保存新的刷新令牌
    await saveRefreshToken(user.id, newRefreshToken);

    // 返回新的令牌
    return NextResponse.json({
      success: true,
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      },
    });
  } catch (error) {
    console.error("刷新令牌失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REFRESH_TOKEN_FAILED",
          message: "刷新令牌失败",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * 用户登出
 * @param {Request} request 请求对象
 * @param {Object} data 登出数据
 * @returns {Promise<Response>} 响应对象
 */
export async function logoutController(request, data) {
  const { refreshToken } = data;

  // 删除刷新令牌
  if (refreshToken) {
    await deleteRefreshToken(refreshToken);
  }

  // 返回成功响应
  return NextResponse.json({
    success: true,
    message: "登出成功",
  });
}

/**
 * 获取当前用户信息
 * @param {Request} request 请求对象
 * @returns {Promise<Response>} 响应对象
 */
export async function getCurrentUserController(request) {
  try {
    console.log("getCurrentUserController开始处理请求");

    // 从令牌中获取用户信息
    const user = await verifyJwtToken(request.token);
    console.log("从令牌中获取的用户信息:", user);

    // 检查用户对象是否存在
    if (!user || !user.userId) {
      console.log("用户对象不存在或userId不存在");
      throw new UnauthorizedError("无效的用户信息");
    }

    // 尝试从缓存获取用户信息
    const cacheKey = `user:${user.userId}`;
    const cachedUser = await cacheUtils.get(cacheKey);

    if (cachedUser) {
      console.log("从缓存获取到用户信息");
      return NextResponse.json({
        success: true,
        data: cachedUser,
        fromCache: true,
      });
    }

    // 缓存未命中，从数据库获取完整的用户信息
    console.log("尝试获取用户ID为", user.userId, "的完整用户信息");
    const userInfo = await getUserById(user.userId);
    if (!userInfo) {
      console.log("未找到用户信息");
      throw new NotFoundError("用户不存在");
    }
    console.log("获取到的用户信息:", userInfo);

    // 构建响应数据
    const userData = {
      id: userInfo.id,
      username: userInfo.username,
      email: userInfo.email,
      walletAddress: userInfo.wallet_address,
      role: userInfo.role,
      createdAt: userInfo.created_at,
      updatedAt: userInfo.updated_at,
    };

    // 将用户信息存入缓存，有效期30分钟
    await cacheUtils.set(cacheKey, userData, 1800);

    // 返回用户信息
    const response = {
      success: true,
      data: userData,
    };
    console.log("返回的响应:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error(
      "获取当前用户信息失败:",
      error.name,
      error.message,
      error.stack
    );
    throw error;
  }
}

/**
 * 更新用户信息
 * @param {Request} request 请求对象
 * @param {Object} data 用户数据
 * @returns {Promise<Response>} 响应对象
 */
export async function updateUserController(request, data) {
  // 从令牌中获取用户信息
  const user = await verifyJwtToken(request.token);

  // 更新用户信息
  const updatedUser = await updateUser(user.userId, data);

  // 返回更新后的用户信息
  return NextResponse.json({
    success: true,
    data: {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      walletAddress: updatedUser.wallet_address,
      role: updatedUser.role,
    },
  });
}

/**
 * 删除用户
 * @param {Request} request 请求对象
 * @returns {Promise<Response>} 响应对象
 */
export async function deleteUserController(request) {
  // 从令牌中获取用户信息
  const user = await verifyJwtToken(request.token);

  // 删除用户
  const isDeleted = await deleteUser(user.userId);
  if (!isDeleted) {
    throw new NotFoundError("用户不存在");
  }

  // 返回成功响应
  return NextResponse.json({
    success: true,
    message: "用户已删除",
  });
}

/**
 * 更新用户设置
 * @param {Request} request 请求对象
 * @param {Object} data 更新数据
 * @returns {Promise<Response>} 响应对象
 */
export async function updateUserSettingsController(request, data) {
  try {
    // 从令牌中获取用户信息
    const user = await verifyJwtToken(request.token);

    // 如果要更改密码，验证当前密码
    if (data.password && data.currentPassword) {
      // 获取用户完整信息（包含密码哈希）
      const userInfo = await getUserById(user.userId);

      // 验证当前密码
      const isPasswordValid = await verifyPassword(
        data.currentPassword,
        userInfo.password_hash
      );
      if (!isPasswordValid) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_PASSWORD",
              message: "当前密码不正确",
            },
          },
          { status: 400 }
        );
      }

      // 移除当前密码字段，不需要存储
      delete data.currentPassword;
    }

    // 更新用户信息
    const updatedUser = await updateUser(user.userId, data);

    // 返回更新后的用户信息
    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        walletAddress: updatedUser.wallet_address,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("更新用户设置失败:", error);
    return createServerErrorResponse(error);
  }
}

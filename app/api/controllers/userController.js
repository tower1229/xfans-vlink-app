import { NextResponse } from "next/server";
import {
  createUser,
  getUserByUsername,
  getUserById,
  verifyPassword,
  generateTokens,
  saveRefreshToken,
  verifyRefreshToken,
  deleteRefreshToken,
  updateUser,
  deleteUser,
} from "@/utils";
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from "../middleware/errorHandler";

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
    const { accessToken, refreshToken } = generateTokens(user);

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
  const { accessToken, refreshToken } = generateTokens(user);

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
 * 刷新令牌
 * @param {Request} request 请求对象
 * @param {Object} data 刷新令牌数据
 * @returns {Promise<Response>} 响应对象
 */
export async function refreshTokenController(request, data) {
  const { refreshToken } = data;

  // 验证刷新令牌
  const user = await verifyRefreshToken(refreshToken);
  if (!user) {
    throw new UnauthorizedError("无效的刷新令牌");
  }

  // 删除旧的刷新令牌
  await deleteRefreshToken(refreshToken);

  // 生成新的令牌
  const tokens = generateTokens(user);

  // 保存新的刷新令牌
  await saveRefreshToken(user.id, tokens.refreshToken);

  // 返回新的令牌
  return NextResponse.json({
    success: true,
    data: {
      tokens,
    },
  });
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
  // 从请求中获取用户信息
  const user = request.user;

  // 获取完整的用户信息
  const userInfo = await getUserById(user.userId);
  if (!userInfo) {
    throw new NotFoundError("用户不存在");
  }

  // 返回用户信息
  return NextResponse.json({
    success: true,
    data: {
      id: userInfo.id,
      username: userInfo.username,
      email: userInfo.email,
      walletAddress: userInfo.wallet_address,
      role: userInfo.role,
    },
  });
}

/**
 * 更新用户信息
 * @param {Request} request 请求对象
 * @param {Object} data 用户数据
 * @returns {Promise<Response>} 响应对象
 */
export async function updateUserController(request, data) {
  // 从请求中获取用户信息
  const user = request.user;

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
  // 从请求中获取用户信息
  const user = request.user;

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

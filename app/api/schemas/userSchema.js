import { z } from "zod";
import { isAddress } from "viem";

/**
 * 用户注册验证模式
 */
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "用户名至少需要3个字符")
    .max(50, "用户名最多50个字符"),
  email: z.string().email("请输入有效的邮箱地址").optional(),
  password: z
    .string()
    .min(6, "密码至少需要6个字符")
    .max(100, "密码最多100个字符"),
  walletAddress: z
    .string()
    .refine((val) => !val || isAddress(val), "请输入有效的钱包地址")
    .optional(),
});

/**
 * 用户登录验证模式
 */
export const loginSchema = z.object({
  username: z.string().min(1, "请输入用户名"),
  password: z.string().min(1, "请输入密码"),
});

/**
 * 刷新令牌验证模式
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "请提供刷新令牌"),
});

/**
 * 登出验证模式
 */
export const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

/**
 * 更新用户信息验证模式
 */
export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, "用户名至少需要3个字符")
    .max(50, "用户名最多50个字符")
    .optional(),
  email: z.string().email("请输入有效的邮箱地址").optional(),
  password: z
    .string()
    .min(6, "密码至少需要6个字符")
    .max(100, "密码最多100个字符")
    .optional(),
  walletAddress: z
    .string()
    .refine((val) => !val || isAddress(val), "请输入有效的钱包地址")
    .optional(),
});

/**
 * 用户设置验证模式
 */
export const userSettingsSchema = z
  .object({
    username: z
      .string()
      .min(3, "用户名至少需要3个字符")
      .max(50, "用户名最多50个字符")
      .optional(),
    email: z.string().email("请输入有效的邮箱地址").optional(),
    password: z
      .string()
      .min(6, "密码至少需要6个字符")
      .max(100, "密码最多100个字符")
      .optional(),
    currentPassword: z
      .string()
      .min(6, "当前密码至少需要6个字符")
      .max(100, "当前密码最多100个字符")
      .optional(),
    walletAddress: z
      .string()
      .refine((val) => !val || isAddress(val), "请输入有效的钱包地址")
      .optional(),
  })
  .refine(
    (data) => {
      // 如果要更改密码，必须提供当前密码
      if (data.password && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: "更改密码时必须提供当前密码",
      path: ["currentPassword"],
    }
  );

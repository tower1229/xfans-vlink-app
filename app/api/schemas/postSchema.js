import { z } from "zod";

/**
 * 创建付费内容的验证模式
 */
export const createPostSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(100, "标题不能超过100个字符"),
  image: z.string().url("图片URL格式不正确"),
  price: z
    .string()
    .min(1, "价格不能为空")
    .refine(
      (val) => {
        try {
          BigInt(val);
          return true;
        } catch (e) {
          return false;
        }
      },
      {
        message: "价格必须是有效的数字",
      }
    ),
  tokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "代币地址格式不正确"),
  chainId: z.number().int().positive("链ID必须是正整数"),
  ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "所有者地址格式不正确"),
});

/**
 * 更新付费内容的验证模式
 */
export const updatePostSchema = z.object({
  title: z
    .string()
    .min(1, "标题不能为空")
    .max(100, "标题不能超过100个字符")
    .optional(),
  image: z.string().url("图片URL格式不正确").optional(),
  price: z
    .string()
    .refine(
      (val) => {
        try {
          BigInt(val);
          return true;
        } catch (e) {
          return false;
        }
      },
      {
        message: "价格必须是有效的数字",
      }
    )
    .optional(),
  tokenAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "代币地址格式不正确")
    .optional(),
  chainId: z.number().int().positive("链ID必须是正整数").optional(),
  ownerAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "所有者地址格式不正确")
    .optional(),
});

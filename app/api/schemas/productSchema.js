import { z } from "zod";
import { isAddress } from "viem";

// 自定义验证器：以太坊地址
const ethereumAddress = () =>
  z.string().refine((value) => isAddress(value), {
    message: "无效的以太坊地址",
  });

// 创建产品验证模式
export const createProductSchema = z.object({
  id: z.string().min(1, "产品ID不能为空").optional(),
  title: z.string().min(1, "产品名称不能为空"),
  image: z.string().url("产品图片必须是有效的URL"),
  price: z.string().min(1, "产品价格不能为空"),
  tokenAddress: ethereumAddress(),
  chainId: z
    .union([
      z.string().transform((val) => parseInt(val, 10)),
      z.number().int().positive("区块链ID必须是正整数"),
    ])
    .refine((val) => !isNaN(val) && val > 0, {
      message: "区块链ID必须是正整数",
    }),
  ownerAddress: ethereumAddress(),
});

// 更新产品验证模式
export const updateProductSchema = z
  .object({
    title: z.string().min(1, "产品名称不能为空").optional(),
    image: z.string().url("产品图片必须是有效的URL").optional(),
    price: z.string().min(1, "产品价格不能为空").optional(),
    tokenAddress: ethereumAddress().optional(),
    chainId: z
      .union([
        z.string().transform((val) => parseInt(val, 10)),
        z.number().int().positive("区块链ID必须是正整数"),
      ])
      .refine((val) => !isNaN(val) && val > 0, {
        message: "区块链ID必须是正整数",
      })
      .optional(),
    ownerAddress: ethereumAddress().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "至少需要提供一个要更新的字段",
  });

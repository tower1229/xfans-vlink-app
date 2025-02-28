import { z } from "zod";
import { isAddress } from "viem";

// 自定义验证器：以太坊地址
const ethereumAddress = () =>
  z.string().refine((value) => isAddress(value), {
    message: "无效的以太坊地址",
  });

// 创建订单验证模式
export const createOrderSchema = z.object({
  productId: z.string().min(1, "产品ID不能为空"),
  userAddress: ethereumAddress(),
});

// 更新订单状态验证模式
export const updateOrderStatusSchema = z.object({
  status: z.enum(["closed"], {
    errorMap: () => ({
      message: "订单只能被更新为已关闭(closed)状态",
    }),
  }),
  transactionHash: z.string().optional(),
});

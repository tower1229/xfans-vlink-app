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
export const updateOrderStatusSchema = z
  .object({
    status: z.enum(["pending", "completed", "failed", "expired"], {
      errorMap: () => ({
        message: "状态必须是以下之一: pending, completed, failed, expired",
      }),
    }),
    transactionHash: z.string().optional(),
  })
  .refine((data) => !(data.status === "completed" && !data.transactionHash), {
    message: "状态为completed时必须提供transactionHash",
    path: ["transactionHash"],
  });

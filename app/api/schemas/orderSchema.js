import { z } from "zod";

// 创建订单验证模式
export const createOrderSchema = z.object({
  productId: z.string().min(1, "产品ID不能为空"),
  chainId: z.string().min(1, "链ID不能为空"),
});

// 更新订单状态验证模式
export const updateOrderStatusSchema = z.object({
  status: z.enum(["closed", "completed"], {
    errorMap: () => ({
      message: "订单只能被更新为已关闭(closed)或已完成(completed)状态",
    }),
  }),
  transactionHash: z.string().optional(),
});

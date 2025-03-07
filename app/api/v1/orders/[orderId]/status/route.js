import { NextResponse } from "next/server";
import { updateOrderStatusController } from "../../../../controllers";
import { withAuthAPI } from "../../../../middleware";
import {
  validateData,
  createServerErrorResponse,
  createValidationErrorResponse,
} from "../../../../utils/validation";
import { verifySignature } from "../../../../middleware/eventListenerAuth";
import { updateOrderStatusSchema } from "../../../../schemas/orderSchema";

// 更新订单状态
export async function PUT(request, { params }) {
  try {
    // 确保params是已解析的对象
    const resolvedParams = await Promise.resolve(params);
    const orderId = resolvedParams.orderId;

    // 获取请求数据
    const data = await request.json();

    // 使用通用验证工具验证数据
    const validation = validateData(data, updateOrderStatusSchema);
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors);
    }

    // 如果是completed状态，验证签名
    if (data.status === "completed") {
      const timestamp = request.headers.get("X-Timestamp");
      const signature = request.headers.get("X-Signature");

      // 检查时间戳和签名是否存在
      if (!timestamp || !signature) {
        return NextResponse.json(
          { success: false, message: "缺少必要的认证信息：时间戳或签名" },
          { status: 401 }
        );
      }

      // 验证签名
      const isValidSignature = await verifySignature(
        data,
        timestamp,
        signature
      );
      if (!isValidSignature) {
        return NextResponse.json(
          { success: false, message: "无效的请求签名" },
          { status: 401 }
        );
      }
    }

    // 调用控制器更新订单状态
    try {
      const response = await updateOrderStatusController(
        request,
        orderId,
        validation.data
      );
      return response;
    } catch (controllerError) {
      console.error("控制器错误:", controllerError);
      return createServerErrorResponse(controllerError);
    }
  } catch (error) {
    console.error("路由处理错误:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "服务器内部错误",
      },
      { status: 500 }
    );
  }
}

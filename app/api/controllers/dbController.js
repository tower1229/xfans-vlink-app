import { NextResponse } from "next/server";
import { initializeDatabase } from "../../utils";

/**
 * 初始化数据库
 * @param {Request} request 请求对象
 * @returns {Promise<Response>} 响应对象
 */
export async function initDatabaseController(request) {
  const success = await initializeDatabase();

  if (success) {
    return NextResponse.json({
      success: true,
      message: "数据库初始化成功",
      data: {
        tables: ["products", "orders"],
        sampleData: true,
      },
    });
  } else {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DB_INIT_FAILED",
          message: "数据库初始化失败",
        },
      },
      { status: 500 }
    );
  }
}

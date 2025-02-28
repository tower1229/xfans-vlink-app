import { NextResponse } from "next/server";

// 重定向到新版本API
export async function GET(request) {
  return NextResponse.redirect(new URL("/api/v1/init-db", request.url));
}

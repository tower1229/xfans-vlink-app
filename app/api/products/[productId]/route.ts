import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const productId = params.productId;

  // 生成1-100之间的随机数，并保留两位小数
  const randomPrice = parseFloat((Math.random() * 99 + 1).toFixed(2));

  // 这里只返回测试数据，实际项目中可以从数据库或其他数据源获取
  const productData = {
    price: randomPrice,
    owner: "0x34d0B59D2E1262FD04445F7768F649fF6DC431a7",
    title: `Product ${productId}`,
    image: `https://picsum.photos/seed/${productId}/400/400`,
  };

  return NextResponse.json(productData);
}

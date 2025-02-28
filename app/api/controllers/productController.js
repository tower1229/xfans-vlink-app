import { NextResponse } from "next/server";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/utils";
import { NotFoundError } from "../middleware/errorHandler";

/**
 * 获取所有产品
 * @param {Request} request 请求对象
 * @returns {Promise<Response>} 响应对象
 */
export async function getAllProductsController(request) {
  // 获取所有产品
  const products = await getAllProducts();

  // 格式化产品数据
  const formattedProducts = products.map((product) => ({
    id: product.id,
    title: product.title,
    image: product.image,
    price: product.price.toString(),
    tokenAddress: product.tokenAddress,
    chainId: product.chainId,
    ownerAddress: product.ownerAddress,
  }));

  return NextResponse.json({
    success: true,
    data: formattedProducts,
  });
}

/**
 * 获取单个产品
 * @param {Request} request 请求对象
 * @param {string} productId 产品ID
 * @returns {Promise<Response>} 响应对象
 */
export async function getProductByIdController(request, productId) {
  // 获取产品
  const product = await getProductById(productId);

  // 如果产品不存在
  if (!product) {
    throw new NotFoundError("产品不存在");
  }

  // 返回产品信息
  return NextResponse.json({
    success: true,
    data: {
      id: product.id,
      title: product.title,
      image: product.image,
      price: product.price.toString(),
      tokenAddress: product.tokenAddress,
      chainId: product.chainId,
      ownerAddress: product.ownerAddress,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    },
  });
}

/**
 * 创建产品
 * @param {Request} request 请求对象
 * @param {Object} data 产品数据
 * @returns {Promise<Response>} 响应对象
 */
export async function createProductController(request, data) {
  // 创建产品
  const product = await createProduct({
    // ID 由服务端生成，不需要前端提交
    title: data.title,
    image: data.image,
    price: BigInt(data.price),
    tokenAddress: data.tokenAddress,
    chainId: data.chainId,
    ownerAddress: data.ownerAddress,
  });

  // 返回创建的产品
  return NextResponse.json(
    {
      success: true,
      data: {
        id: product.id,
        title: product.title,
        image: product.image,
        price: product.price.toString(),
        tokenAddress: product.tokenAddress,
        chainId: product.chainId,
        ownerAddress: product.ownerAddress,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    },
    { status: 201 }
  );
}

/**
 * 更新产品
 * @param {Request} request 请求对象
 * @param {string} productId 产品ID
 * @param {Object} data 更新数据
 * @returns {Promise<Response>} 响应对象
 */
export async function updateProductController(request, productId, data) {
  // 检查产品是否存在
  const existingProduct = await getProductById(productId);
  if (!existingProduct) {
    throw new NotFoundError("产品不存在");
  }

  // 准备更新数据
  const updates = {};
  const allowedFields = [
    "title",
    "image",
    "price",
    "tokenAddress",
    "chainId",
    "ownerAddress",
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updates[field] = field === "price" ? BigInt(data[field]) : data[field];
    }
  });

  // 如果没有要更新的字段
  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "没有提供要更新的字段",
        },
      },
      { status: 400 }
    );
  }

  // 更新产品
  const updatedProduct = await updateProduct(productId, updates);

  // 返回更新后的产品
  return NextResponse.json({
    success: true,
    data: {
      id: updatedProduct.id,
      title: updatedProduct.title,
      image: updatedProduct.image,
      price: updatedProduct.price.toString(),
      tokenAddress: updatedProduct.tokenAddress,
      chainId: updatedProduct.chainId,
      ownerAddress: updatedProduct.ownerAddress,
      createdAt: updatedProduct.createdAt,
      updatedAt: updatedProduct.updatedAt,
    },
  });
}

/**
 * 删除产品
 * @param {Request} request 请求对象
 * @param {string} productId 产品ID
 * @returns {Promise<Response>} 响应对象
 */
export async function deleteProductController(request, productId) {
  try {
    console.log(`尝试删除产品: ${productId}`);

    // 检查产品是否存在
    const existingProduct = await getProductById(productId);
    if (!existingProduct) {
      console.log(`产品不存在: ${productId}`);
      throw new NotFoundError("产品不存在");
    }

    console.log(`产品存在，准备删除: ${productId}`);

    // 删除产品
    const success = await deleteProduct(productId);

    console.log(`删除产品结果: ${success ? "成功" : "失败"}`);

    if (success) {
      return NextResponse.json({
        success: true,
        message: "产品删除成功",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DELETE_FAILED",
            message: "产品删除失败",
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`删除产品时发生错误: ${error.message}`);
    throw error;
  }
}

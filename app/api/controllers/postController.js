import { NextResponse } from "next/server";
import {
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getPostsByOwner,
} from "../utils/postUtils";
import { verifyJwtToken, getUserById } from "../utils/userUtils";

/**
 * 获取所有付费内容
 * @param {Request} request 请求对象
 * @returns {Promise<Response>} 响应对象
 */
export async function getAllPostsController(request) {
  // 从令牌中获取用户信息
  const user = await verifyJwtToken(request.token);

  // 获取当前用户的付费内容
  const posts = await getPostsByOwner(user.walletAddress);

  // 格式化付费内容数据
  const formattedPosts = posts.map((post) => ({
    id: post.id,
    title: post.title,
    image: post.image,
    price: post.price.toString(),
    tokenAddress: post.tokenAddress,
    chainId: post.chainId,
    ownerAddress: post.ownerAddress,
  }));

  return NextResponse.json({
    success: true,
    data: formattedPosts,
  });
}

/**
 * 获取单个付费内容
 * @param {Request} request 请求对象
 * @param {string} postId 内容ID
 * @returns {Promise<Response>} 响应对象
 */
export async function getPostByIdController(request, postId) {
  // 从令牌中获取用户信息
  const user = await verifyJwtToken(request.token);

  // 获取付费内容
  const post = await getPostById(postId);

  // 如果付费内容不存在
  if (!post) {
    throw new NotFoundError("付费内容不存在");
  }

  // 检查是否是当前用户的付费内容
  if (post.ownerAddress !== user.walletAddress) {
    throw new UnauthorizedError("您没有权限查看此付费内容");
  }

  // 返回付费内容信息
  return NextResponse.json({
    success: true,
    data: {
      id: post.id,
      title: post.title,
      image: post.image,
      price: post.price.toString(),
      tokenAddress: post.tokenAddress,
      chainId: post.chainId,
      ownerAddress: post.ownerAddress,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    },
  });
}

/**
 * 创建付费内容
 * @param {Request} request 请求对象
 * @param {Object} data 付费内容数据
 * @returns {Promise<Response>} 响应对象
 */
export async function createPostController(request, data) {
  // 从令牌中获取用户信息
  const tokenPayload = await verifyJwtToken(request.token);
  const user = await getUserById(tokenPayload.userId);
  console.log("create user", user);

  // 创建付费内容
  const post = await createPost({
    // ID 由服务端生成，不需要前端提交
    title: data.title,
    image: data.image,
    price: BigInt(data.price),
    tokenAddress: data.tokenAddress,
    chainId: data.chainId,
    ownerAddress: user.walletAddress, // 使用当前用户的钱包地址
  });

  // 返回创建的付费内容
  return NextResponse.json(
    {
      success: true,
      data: {
        id: post.id,
        title: post.title,
        image: post.image,
        price: post.price.toString(),
        tokenAddress: post.tokenAddress,
        chainId: post.chainId,
        ownerAddress: post.ownerAddress,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    },
    { status: 201 }
  );
}

/**
 * 更新付费内容
 * @param {Request} request 请求对象
 * @param {string} postId 内容ID
 * @param {Object} data 更新数据
 * @returns {Promise<Response>} 响应对象
 */
export async function updatePostController(request, postId, data) {
  // 从令牌中获取用户信息
  const user = await verifyJwtToken(request.token);

  // 检查付费内容是否存在
  const existingPost = await getPostById(postId);
  if (!existingPost) {
    throw new NotFoundError("付费内容不存在");
  }

  // 检查是否是当前用户的付费内容
  if (existingPost.ownerAddress !== user.walletAddress) {
    throw new UnauthorizedError("您没有权限更新此付费内容");
  }

  // 准备更新数据
  const updates = {};
  const allowedFields = ["title", "image", "price", "tokenAddress", "chainId"];

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
        message: "没有提供要更新的字段",
      },
      { status: 400 }
    );
  }

  // 更新付费内容
  const updatedPost = await updatePost(postId, updates);

  // 返回更新后的付费内容
  return NextResponse.json({
    success: true,
    data: {
      id: updatedPost.id,
      title: updatedPost.title,
      image: updatedPost.image,
      price: updatedPost.price.toString(),
      tokenAddress: updatedPost.tokenAddress,
      chainId: updatedPost.chainId,
      ownerAddress: updatedPost.ownerAddress,
      createdAt: updatedPost.createdAt,
      updatedAt: updatedPost.updatedAt,
    },
  });
}

/**
 * 删除付费内容
 * @param {Request} request 请求对象
 * @param {string} postId 内容ID
 * @returns {Promise<Response>} 响应对象
 */
export async function deletePostController(request, postId) {
  try {
    console.log(`尝试删除付费内容: ${postId}`);

    // 从令牌中获取用户信息
    const user = await verifyJwtToken(request.token);

    // 检查付费内容是否存在
    const existingPost = await getPostById(postId);
    if (!existingPost) {
      console.log(`付费内容不存在: ${postId}`);
      throw new NotFoundError("付费内容不存在");
    }

    // 检查是否是当前用户的付费内容
    if (existingPost.ownerAddress !== user.walletAddress) {
      console.log(`用户 ${user.walletAddress} 无权删除付费内容 ${postId}`);
      throw new UnauthorizedError("您没有权限删除此付费内容");
    }

    console.log(`付费内容存在，准备删除: ${postId}`);

    // 删除付费内容
    const success = await deletePost(postId);

    console.log(`删除付费内容结果: ${success ? "成功" : "失败"}`);

    if (success) {
      return NextResponse.json({
        success: true,
        message: "付费内容删除成功",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "付费内容删除失败",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`删除付费内容时发生错误: ${error.message}`);
    throw error;
  }
}

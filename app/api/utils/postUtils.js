import { db } from "../lib/db";
import { v4 as uuidv4 } from "uuid";

/**
 * 获取所有付费内容
 * @returns {Promise<Array>} 付费内容列表
 */
export async function getAllPosts() {
  try {
    return await db.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("获取付费内容列表失败:", error);
    throw error;
  }
}

/**
 * 根据ID获取付费内容
 * @param {string} id 内容ID
 * @returns {Promise<Object|null>} 付费内容对象或null
 */
export async function getPostById(id) {
  try {
    return await db.post.findUnique({
      where: {
        id: id,
      },
    });
  } catch (error) {
    console.error("获取付费内容失败:", error);
    throw error;
  }
}

/**
 * 创建付费内容
 * @param {Object} data 内容数据
 * @returns {Promise<Object>} 创建的内容
 */
export async function createPost(data) {
  try {
    const id = uuidv4();
    return await db.post.create({
      data: {
        id,
        title: data.title,
        content: data.content,
        image: data.image,
        price: data.price,
        tokenAddress: data.tokenAddress,
        chainId: data.chainId,
        ownerAddress: data.ownerAddress,
      },
    });
  } catch (error) {
    console.error("创建付费内容失败:", error);
    throw error;
  }
}

/**
 * 更新付费内容
 * @param {string} id 内容ID
 * @param {Object} data 更新数据
 * @returns {Promise<Object>} 更新后的内容
 */
export async function updatePost(id, data) {
  try {
    return await db.post.update({
      where: {
        id: id,
      },
      data: data,
    });
  } catch (error) {
    console.error("更新付费内容失败:", error);
    throw error;
  }
}

/**
 * 删除付费内容
 * @param {string} id 内容ID
 * @returns {Promise<Object>} 删除的内容
 */
export async function deletePost(id) {
  try {
    return await db.post.delete({
      where: {
        id: id,
      },
    });
  } catch (error) {
    console.error("删除付费内容失败:", error);
    throw error;
  }
}

/**
 * 根据所有者获取付费内容
 * @param {string} ownerAddress 所有者地址
 * @returns {Promise<Array>} 付费内容列表
 */
export async function getPostsByOwner(ownerAddress) {
  try {
    return await db.post.findMany({
      where: {
        ownerAddress: ownerAddress,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("获取用户付费内容失败:", error);
    throw error;
  }
}

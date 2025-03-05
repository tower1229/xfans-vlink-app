"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/(core)/dashboard-layout";
import { Post, PostFormData } from "@/_types/post";
import { fetchPosts, createPost, updatePost, deletePost } from "@/_actions/postActions";

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    image: "",
    price: "",
    tokenAddress: "",
    chainId: "",
    ownerAddress: "",
  });

  // 获取所有付费内容
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await fetchPosts();
      setPosts(data);
    } catch (err: any) {
      setError(err.message);
      console.error("获取付费内容失败:", err);
    } finally {
      setLoading(false);
    }
  };

  // 创建付费内容
  const handleCreate = async () => {
    try {
      console.log("准备创建付费内容，表单数据:", formData);
      await createPost(formData);

      // 重新获取付费内容列表
      await loadPosts();

      // 关闭模态框并重置表单
      setShowCreateModal(false);
      resetForm();
    } catch (err: any) {
      console.error("创建付费内容失败:", err);
      setError(err.message || "创建付费内容失败，请检查输入数据是否正确");
    }
  };

  // 更新付费内容
  const handleUpdate = async () => {
    try {
      if (!currentPost?.id) {
        throw new Error("无效的付费内容ID");
      }

      await updatePost(currentPost.id, formData);

      // 重新获取付费内容列表
      await loadPosts();

      // 关闭模态框并重置表单
      setShowEditModal(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
      console.error("更新付费内容失败:", err);
    }
  };

  // 删除付费内容
  const handleDelete = async (postId: string) => {
    if (!confirm("确定要删除这个付费内容吗？")) {
      return;
    }

    try {
      await deletePost(postId);

      // 重新获取付费内容列表
      await loadPosts();
    } catch (err: any) {
      setError(err.message);
      console.error("删除付费内容失败:", err);
    }
  };

  // 打开编辑模态框
  const openEditModal = (post: Post) => {
    setCurrentPost(post);
    setFormData({
      title: post.title,
      image: post.image,
      price: post.price,
      tokenAddress: post.tokenAddress,
      chainId: post.chainId,
      ownerAddress: post.ownerAddress,
    });
    setShowEditModal(true);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      title: "",
      image: "",
      price: "",
      tokenAddress: "",
      chainId: "",
      ownerAddress: "",
    });
    setCurrentPost(null);
  };

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 渲染创建模态框
  const renderCreateModal = () => {
    return (
      <div className="flex bg-black/50 inset-0 z-50 fixed items-center justify-center">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h2 className="font-bold text-xl mb-4">创建新付费内容</h2>
          <div className="space-y-4">
            <div>
              <label className="font-medium text-sm text-gray-700 block">
                标题
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="border rounded-md border-gray-300 shadow-xs mt-1 w-full p-2 block"
                placeholder="付费内容标题"
              />
            </div>
            <div>
              <label className="font-medium text-sm text-gray-700 block">
                图片URL
              </label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="border rounded-md border-gray-300 shadow-xs mt-1 w-full p-2 block"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="font-medium text-sm text-gray-700 block">
                价格
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="border rounded-md border-gray-300 shadow-xs mt-1 w-full p-2 block"
                placeholder="1000000000000000000"
              />
            </div>
            <div>
              <label className="font-medium text-sm text-gray-700 block">
                代币地址
              </label>
              <input
                type="text"
                name="tokenAddress"
                value={formData.tokenAddress}
                onChange={handleInputChange}
                className="border rounded-md border-gray-300 shadow-xs mt-1 w-full p-2 block"
                placeholder="0x0000000000000000000000000000000000000000"
              />
            </div>
            <div>
              <label className="font-medium text-sm text-gray-700 block">
                链ID
              </label>
              <input
                type="text"
                name="chainId"
                value={formData.chainId}
                onChange={handleInputChange}
                className="border rounded-md border-gray-300 shadow-xs mt-1 w-full p-2 block"
                placeholder="1"
              />
            </div>
            <div>
              <label className="font-medium text-sm text-gray-700 block">
                所有者地址
              </label>
              <input
                type="text"
                name="ownerAddress"
                value={formData.ownerAddress}
                onChange={handleInputChange}
                className="border rounded-md border-gray-300 shadow-xs mt-1 w-full p-2 block"
                placeholder="0x0000000000000000000000000000000000000000"
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-6 justify-end">
            <button
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              className="border rounded-md font-medium border-gray-300 text-sm py-2 px-4 text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleCreate}
              className="border border-transparent rounded-md font-medium bg-blue-600 text-sm text-white py-2 px-4 hover:bg-blue-700"
            >
              创建
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 渲染编辑模态框
  const renderEditModal = () => {
    return (
      <div className="flex bg-black/50 inset-0 z-50 fixed items-center justify-center">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h2 className="font-bold text-xl mb-4">编辑付费内容</h2>
          <div className="space-y-4">
            <div>
              <label className="font-medium text-sm text-gray-700 block">
                标题
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="border rounded-md border-gray-300 shadow-xs mt-1 w-full p-2 block"
              />
            </div>
            <div>
              <label className="font-medium text-sm text-gray-700 block">
                图片URL
              </label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="border rounded-md border-gray-300 shadow-xs mt-1 w-full p-2 block"
              />
            </div>
            <div>
              <label className="font-medium text-sm text-gray-700 block">
                价格
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="border rounded-md border-gray-300 shadow-xs mt-1 w-full p-2 block"
              />
            </div>
            <div>
              <label className="font-medium text-sm text-gray-700 block">
                代币地址
              </label>
              <input
                type="text"
                name="tokenAddress"
                value={formData.tokenAddress}
                onChange={handleInputChange}
                className="border rounded-md border-gray-300 shadow-xs mt-1 w-full p-2 block"
              />
            </div>
            <div>
              <label className="font-medium text-sm text-gray-700 block">
                链ID
              </label>
              <input
                type="text"
                name="chainId"
                value={formData.chainId}
                onChange={handleInputChange}
                className="border rounded-md border-gray-300 shadow-xs mt-1 w-full p-2 block"
              />
            </div>
            <div>
              <label className="font-medium text-sm text-gray-700 block">
                所有者地址
              </label>
              <input
                type="text"
                name="ownerAddress"
                value={formData.ownerAddress}
                onChange={handleInputChange}
                className="border rounded-md border-gray-300 shadow-xs mt-1 w-full p-2 block"
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-6 justify-end">
            <button
              onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}
              className="border rounded-md font-medium border-gray-300 text-sm py-2 px-4 text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleUpdate}
              className="border border-transparent rounded-md font-medium bg-blue-600 text-sm text-white py-2 px-4 hover:bg-blue-700"
            >
              更新
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex mb-6 justify-between items-center">
          <h1 className="font-bold text-2xl">付费内容管理</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-md bg-blue-600 text-white py-2 px-4 hover:bg-blue-700"
          >
            创建付费内容
          </button>
        </div>

        {error && (
          <div className="border rounded-sm bg-red-100 border-red-400 mb-4 py-3 px-4 text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex py-5 px-4 justify-between items-center sm:px-6">
            <h2 className="font-medium text-lg text-gray-900">付费内容列表</h2>
            <p className="text-sm text-gray-500">{posts.length} 个付费内容</p>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="divide-y min-w-full divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="font-medium text-left text-xs tracking-wider py-3 px-6 text-gray-500 uppercase"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="font-medium text-left text-xs tracking-wider py-3 px-6 text-gray-500 uppercase"
                    >
                      标题
                    </th>
                    <th
                      scope="col"
                      className="font-medium text-left text-xs tracking-wider py-3 px-6 text-gray-500 uppercase"
                    >
                      图片
                    </th>
                    <th
                      scope="col"
                      className="font-medium text-left text-xs tracking-wider py-3 px-6 text-gray-500 uppercase"
                    >
                      价格
                    </th>
                    <th
                      scope="col"
                      className="font-medium text-left text-xs tracking-wider py-3 px-6 text-gray-500 uppercase"
                    >
                      链ID
                    </th>
                    <th
                      scope="col"
                      className="font-medium text-left text-xs tracking-wider py-3 px-6 text-gray-500 uppercase"
                    >
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 px-6">
                        加载中...
                      </td>
                    </tr>
                  ) : posts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 px-6">
                        暂无付费内容
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr key={post.id}>
                        <td className="text-sm py-4 px-6 text-gray-500 whitespace-nowrap">
                          {post.id}
                        </td>
                        <td className="font-medium text-sm py-4 px-6 text-gray-900 whitespace-nowrap">
                          {post.title}
                        </td>
                        <td className="text-sm py-4 px-6 text-gray-500 whitespace-nowrap">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="rounded-sm object-cover h-10 w-10"
                          />
                        </td>
                        <td className="text-sm py-4 px-6 text-gray-500 whitespace-nowrap">
                          {post.price}
                        </td>
                        <td className="text-sm py-4 px-6 text-gray-500 whitespace-nowrap">
                          {post.chainId}
                        </td>
                        <td className="font-medium text-sm py-4 px-6 whitespace-nowrap">
                          <button
                            onClick={() => openEditModal(post)}
                            className="mr-3 text-indigo-600 hover:text-indigo-900"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && renderCreateModal()}
      {showEditModal && renderEditModal()}
    </DashboardLayout>
  );
}

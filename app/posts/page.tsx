"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../dashboard-layout";
import { fetchWithAuth } from "../utils/api";

// 定义付费内容类型接口
interface Post {
    id: string;
    title: string;
    image: string;
    price: string;
    tokenAddress: string;
    chainId: number;
    ownerAddress: string;
    createdAt?: string;
    updatedAt?: string;
}

// 定义表单数据类型接口
interface FormData {
    id?: string;
    title: string;
    image: string;
    price: string;
    tokenAddress: string;
    chainId: string | number;
    ownerAddress: string;
}

export default function Posts() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>("all");
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [currentPost, setCurrentPost] = useState<Post | null>(null);
    const [formData, setFormData] = useState<FormData>({
        title: "",
        image: "",
        price: "",
        tokenAddress: "",
        chainId: "",
        ownerAddress: "",
    });

    // 获取所有付费内容
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await fetchWithAuth("/api/v1/posts");
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error?.message || "获取付费内容失败");
            }

            setPosts(data.data);
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
            const response = await fetchWithAuth("/api/v1/posts", {
                method: "POST",
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error?.message || "创建付费内容失败");
            }

            // 重新获取付费内容列表
            await fetchPosts();

            // 关闭模态框并重置表单
            setShowCreateModal(false);
            resetForm();
        } catch (err: any) {
            setError(err.message);
            console.error("创建付费内容失败:", err);
        }
    };

    // 更新付费内容
    const handleUpdate = async () => {
        try {
            const response = await fetchWithAuth(`/api/v1/posts/${currentPost?.id}`, {
                method: "PUT",
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error?.message || "更新付费内容失败");
            }

            // 重新获取付费内容列表
            await fetchPosts();

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
            const response = await fetchWithAuth(`/api/v1/posts/${postId}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error?.message || "删除付费内容失败");
            }

            // 重新获取付费内容列表
            await fetchPosts();
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4">创建新付费内容</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                标题
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-xs p-2"
                                placeholder="付费内容标题"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                图片URL
                            </label>
                            <input
                                type="text"
                                name="image"
                                value={formData.image}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-xs p-2"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                价格
                            </label>
                            <input
                                type="text"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-xs p-2"
                                placeholder="1000000000000000000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                代币地址
                            </label>
                            <input
                                type="text"
                                name="tokenAddress"
                                value={formData.tokenAddress}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-xs p-2"
                                placeholder="0x0000000000000000000000000000000000000000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                链ID
                            </label>
                            <input
                                type="text"
                                name="chainId"
                                value={formData.chainId}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-xs p-2"
                                placeholder="1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                所有者地址
                            </label>
                            <input
                                type="text"
                                name="ownerAddress"
                                value={formData.ownerAddress}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-xs p-2"
                                placeholder="0x0000000000000000000000000000000000000000"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            onClick={() => {
                                setShowCreateModal(false);
                                resetForm();
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            取消
                        </button>
                        <button
                            onClick={handleCreate}
                            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4">编辑付费内容</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                标题
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-xs p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                图片URL
                            </label>
                            <input
                                type="text"
                                name="image"
                                value={formData.image}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-xs p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                价格
                            </label>
                            <input
                                type="text"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-xs p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                代币地址
                            </label>
                            <input
                                type="text"
                                name="tokenAddress"
                                value={formData.tokenAddress}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-xs p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                链ID
                            </label>
                            <input
                                type="text"
                                name="chainId"
                                value={formData.chainId}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-xs p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                所有者地址
                            </label>
                            <input
                                type="text"
                                name="ownerAddress"
                                value={formData.ownerAddress}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-xs p-2"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            onClick={() => {
                                setShowEditModal(false);
                                resetForm();
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            取消
                        </button>
                        <button
                            onClick={handleUpdate}
                            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
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
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">付费内容管理</h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        创建付费内容
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-sm mb-4">
                        {error}
                    </div>
                )}

                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">付费内容列表</h2>
                        <p className="text-sm text-gray-500">{posts.length} 个付费内容</p>
                    </div>
                    <div className="border-t border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            ID
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            标题
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            图片
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            价格
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            链ID
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            操作
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center">
                                                加载中...
                                            </td>
                                        </tr>
                                    ) : posts.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center">
                                                暂无付费内容
                                            </td>
                                        </tr>
                                    ) : (
                                        posts.map((post) => (
                                            <tr key={post.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {post.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {post.title}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <img
                                                        src={post.image}
                                                        alt={post.title}
                                                        className="h-10 w-10 object-cover rounded-sm"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {post.price}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {post.chainId}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => openEditModal(post)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
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
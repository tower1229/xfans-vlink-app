"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../dashboard-layout";

// 定义产品类型接口
interface Product {
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

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    image: "",
    price: "",
    tokenAddress: "",
    chainId: "",
    ownerAddress: "",
  });

  // 获取所有产品
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/v1/products");
      if (!response.ok) {
        throw new Error("获取产品列表失败");
      }
      const data = await response.json();
      setProducts(data.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "获取产品失败");
      console.error("获取产品失败:", err);
    } finally {
      setLoading(false);
    }
  };

  // 创建产品
  const handleCreateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/v1/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "创建产品失败");
      }

      await fetchProducts();
      setShowCreateModal(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || "创建产品失败");
      console.error("创建产品失败:", err);
    }
  };

  // 更新产品
  const handleUpdateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentProduct) return;

    try {
      const response = await fetch(`/api/v1/products/${currentProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "更新产品失败");
      }

      await fetchProducts();
      setShowEditModal(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || "更新产品失败");
      console.error("更新产品失败:", err);
    }
  };

  // 删除产品
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("确定要删除这个产品吗？")) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "删除产品失败");
      }

      await fetchProducts();
    } catch (err: any) {
      setError(err.message || "删除产品失败");
      console.error("删除产品失败:", err);
    }
  };

  // 打开编辑模态框
  const openEditModal = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      id: product.id,
      title: product.title,
      image: product.image,
      price: product.price,
      tokenAddress: product.tokenAddress,
      chainId: product.chainId,
      ownerAddress: product.ownerAddress,
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
    setCurrentProduct(null);
  };

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 根据链ID获取链名称
  const getChainName = (chainId: number) => {
    const chains: Record<number, string> = {
      1: "以太坊主网",
      11155111: "Sepolia测试网",
      56: "币安智能链",
      137: "Polygon",
    };
    return chains[chainId] || chainId;
  };

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("all")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "all"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              所有产品
            </button>
          </nav>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-800">产品管理</h3>
              <p className="text-sm text-gray-500">{products.length} 个产品</p>
            </div>
            <div className="flex space-x-2">
              <button
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                onClick={() => setShowCreateModal(true)}
              >
                创建产品
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      产品ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      产品名称
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      图片
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      价格
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      区块链
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {product.id}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.title}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="h-10 w-10 object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-400">无图片</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {product.price}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getChainName(product.chainId)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => openEditModal(product)}
                          >
                            编辑
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 创建产品模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              创建新产品
            </h3>
            <form onSubmit={handleCreateProduct}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    产品名称
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 编辑产品模态框 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">编辑产品</h3>
            <form onSubmit={handleUpdateProduct}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    产品ID
                  </label>
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 text-gray-500 sm:text-sm"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    产品名称
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

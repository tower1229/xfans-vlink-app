"use client";

import HomeLayout from "../home-layout";
import Link from "next/link";
import { useState } from "react";

// 模拟内容数据
const contentItems = [
    {
        id: 1,
        title: "数字艺术作品集 #1",
        creator: "艺术家小明",
        creatorId: 1,
        category: "数字艺术",
        price: "0.05 ETH",
        thumbnail: "/content/art1.jpg",
        likes: 128,
        isPremium: true,
    },
    {
        id: 2,
        title: "音乐专辑：城市之声",
        creator: "音乐人小红",
        creatorId: 2,
        category: "音乐",
        price: "0.03 ETH",
        thumbnail: "/content/music1.jpg",
        likes: 85,
        isPremium: true,
    },
    {
        id: 3,
        title: "摄影集：自然之美",
        creator: "摄影师小蓝",
        creatorId: 3,
        category: "摄影",
        price: "0.02 ETH",
        thumbnail: "/content/photo1.jpg",
        likes: 210,
        isPremium: true,
    },
    {
        id: 4,
        title: "小说：未来世界",
        creator: "作家小绿",
        creatorId: 4,
        category: "写作",
        price: "0.01 ETH",
        thumbnail: "/content/writing1.jpg",
        likes: 67,
        isPremium: true,
    },
    {
        id: 5,
        title: "教程：数字绘画入门",
        creator: "艺术家小明",
        creatorId: 1,
        category: "数字艺术",
        price: "免费",
        thumbnail: "/content/art2.jpg",
        likes: 324,
        isPremium: false,
    },
    {
        id: 6,
        title: "单曲：夏日回忆",
        creator: "音乐人小红",
        creatorId: 2,
        category: "音乐",
        price: "免费",
        thumbnail: "/content/music2.jpg",
        likes: 156,
        isPremium: false,
    },
    {
        id: 7,
        title: "摄影技巧分享",
        creator: "摄影师小蓝",
        creatorId: 3,
        category: "摄影",
        price: "免费",
        thumbnail: "/content/photo2.jpg",
        likes: 98,
        isPremium: false,
    },
    {
        id: 8,
        title: "短篇故事集",
        creator: "作家小绿",
        creatorId: 4,
        category: "写作",
        price: "免费",
        thumbnail: "/content/writing2.jpg",
        likes: 112,
        isPremium: false,
    },
];

// 分类列表
const categories = [
    { name: "全部", value: "all" },
    { name: "数字艺术", value: "数字艺术" },
    { name: "音乐", value: "音乐" },
    { name: "摄影", value: "摄影" },
    { name: "写作", value: "写作" },
    { name: "视频", value: "视频" },
    { name: "游戏", value: "游戏" },
];

export default function Explore() {
    // 客户端组件，使用useState
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [priceFilter, setPriceFilter] = useState("all"); // all, free, premium
    const [sortBy, setSortBy] = useState("popular"); // popular, newest

    // 过滤和排序内容
    const filteredContent = contentItems.filter((item) => {
        // 分类过滤
        if (selectedCategory !== "all" && item.category !== selectedCategory) {
            return false;
        }

        // 价格过滤
        if (priceFilter === "free" && item.isPremium) {
            return false;
        }
        if (priceFilter === "premium" && !item.isPremium) {
            return false;
        }

        return true;
    }).sort((a, b) => {
        // 排序
        if (sortBy === "popular") {
            return b.likes - a.likes;
        }
        // 假设ID越大表示越新
        return b.id - a.id;
    });

    return (
        <HomeLayout>
            {/* 页面标题 */}
            <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">探索内容</h1>
                    <p className="text-xl max-w-2xl mx-auto text-white/80">
                        发现X-Fans平台上的精彩内容，支持您喜爱的创作者
                    </p>
                </div>
            </section>

            {/* 过滤和排序控件 */}
            <section className="py-8 bg-white border-b">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        {/* 分类过滤 */}
                        <div className="flex flex-wrap items-center gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category.value}
                                    onClick={() => setSelectedCategory(category.value)}
                                    className={`px-4 py-2 rounded-full text-sm ${selectedCategory === category.value
                                        ? "bg-purple-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        } transition-colors`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>

                        {/* 价格和排序过滤 */}
                        <div className="flex items-center space-x-4">
                            <select
                                value={priceFilter}
                                onChange={(e) => setPriceFilter(e.target.value)}
                                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 bg-white"
                            >
                                <option value="all">所有价格</option>
                                <option value="free">免费内容</option>
                                <option value="premium">付费内容</option>
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 bg-white"
                            >
                                <option value="popular">按热度排序</option>
                                <option value="newest">按最新排序</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* 内容网格 */}
            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-4">
                    {filteredContent.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredContent.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="h-48 bg-gray-200 relative">
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
                                            </svg>
                                        </div>
                                        {item.isPremium && (
                                            <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                                                付费内容
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold mb-1 truncate">{item.title}</h3>
                                        <Link
                                            href={`/creators/${item.creatorId}`}
                                            className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
                                        >
                                            {item.creator}
                                        </Link>
                                        <div className="flex justify-between items-center mt-3">
                                            <span className="text-sm text-gray-600">{item.category}</span>
                                            <span className={`text-sm font-medium ${item.isPremium ? "text-purple-600" : "text-green-600"}`}>
                                                {item.price}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mt-4">
                                            <div className="flex items-center text-gray-500 text-sm">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
                                                </svg>
                                                {item.likes}
                                            </div>
                                            <Link
                                                href={`/content/${item.id}`}
                                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                                            >
                                                查看详情
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <h3 className="text-xl font-medium text-gray-600 mb-2">没有找到符合条件的内容</h3>
                            <p className="text-gray-500">请尝试调整筛选条件</p>
                        </div>
                    )}
                </div>
            </section>

            {/* 订阅提示 */}
            <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-6">想要获取更多优质内容？</h2>
                    <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                        注册成为X-Fans会员，解锁所有付费内容，支持您喜爱的创作者
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link
                            href="/signup"
                            className="px-8 py-4 rounded-full bg-white text-purple-600 font-medium text-center hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
                        >
                            立即注册
                        </Link>
                        <Link
                            href="/pricing"
                            className="px-8 py-4 rounded-full bg-purple-700/30 text-white font-medium text-center hover:bg-purple-700/40 transition-colors"
                        >
                            查看会员方案
                        </Link>
                    </div>
                </div>
            </section>
        </HomeLayout>
    );
}
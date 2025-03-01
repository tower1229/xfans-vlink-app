"use client";

import HomeLayout from "../home-layout";
import Link from "next/link";
import { useState } from "react";

// 模拟创作者数据
const creatorsData = [
    {
        id: 1,
        name: "艺术家小明",
        avatar: "/creators/avatar1.jpg",
        category: "数字艺术",
        followers: 12543,
        contentCount: 48,
        bio: "专注于数字艺术创作，擅长概念设计和角色插画。",
        walletAddress: "0x1234...5678",
        featured: true,
    },
    {
        id: 2,
        name: "音乐人小红",
        avatar: "/creators/avatar2.jpg",
        category: "音乐",
        followers: 8392,
        contentCount: 35,
        bio: "独立音乐制作人，擅长电子音乐和氛围音乐创作。",
        walletAddress: "0x2345...6789",
        featured: true,
    },
    {
        id: 3,
        name: "摄影师小蓝",
        avatar: "/creators/avatar3.jpg",
        category: "摄影",
        followers: 15782,
        contentCount: 127,
        bio: "风光和人像摄影师，作品曾在多个摄影展展出。",
        walletAddress: "0x3456...7890",
        featured: true,
    },
    {
        id: 4,
        name: "作家小绿",
        avatar: "/creators/avatar4.jpg",
        category: "写作",
        followers: 9254,
        contentCount: 62,
        bio: "科幻和奇幻小说作家，已出版多部长篇小说。",
        walletAddress: "0x4567...8901",
        featured: true,
    },
    {
        id: 5,
        name: "视频博主小黄",
        avatar: "/creators/avatar5.jpg",
        category: "视频",
        followers: 25678,
        contentCount: 89,
        bio: "生活方式和旅行视频创作者，喜欢分享旅行经历和生活技巧。",
        walletAddress: "0x5678...9012",
        featured: false,
    },
    {
        id: 6,
        name: "游戏开发者小紫",
        avatar: "/creators/avatar6.jpg",
        category: "游戏",
        followers: 7865,
        contentCount: 23,
        bio: "独立游戏开发者，专注于像素风格和叙事类游戏。",
        walletAddress: "0x6789...0123",
        featured: false,
    },
    {
        id: 7,
        name: "厨师小橙",
        avatar: "/creators/avatar7.jpg",
        category: "美食",
        followers: 18976,
        contentCount: 156,
        bio: "专业厨师，喜欢分享家常菜谱和烹饪技巧。",
        walletAddress: "0x7890...1234",
        featured: false,
    },
    {
        id: 8,
        name: "健身教练小白",
        avatar: "/creators/avatar8.jpg",
        category: "健身",
        followers: 14532,
        contentCount: 78,
        bio: "认证健身教练，专注于科学健身和营养指导。",
        walletAddress: "0x8901...2345",
        featured: false,
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
    { name: "美食", value: "美食" },
    { name: "健身", value: "健身" },
];

export default function Creators() {
    // 客户端组件，使用useState
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("followers"); // followers, contentCount

    // 格式化数字
    const formatNumber = (num: number) => {
        if (num >= 10000) {
            return (num / 1000).toFixed(1) + "K";
        }
        return num.toString();
    };

    // 过滤和排序创作者
    const filteredCreators = creatorsData
        .filter((creator) => {
            // 分类过滤
            if (selectedCategory !== "all" && creator.category !== selectedCategory) {
                return false;
            }

            // 搜索过滤
            if (
                searchQuery &&
                !creator.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !creator.bio.toLowerCase().includes(searchQuery.toLowerCase())
            ) {
                return false;
            }

            return true;
        })
        .sort((a, b) => {
            // 排序
            if (sortBy === "followers") {
                return b.followers - a.followers;
            }
            return b.contentCount - a.contentCount;
        });

    return (
        <HomeLayout>
            {/* 页面标题 */}
            <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">创作者</h1>
                    <p className="text-xl max-w-2xl mx-auto text-white/80">
                        发现X-Fans平台上的优秀创作者，支持他们的创作
                    </p>
                </div>
            </section>

            {/* 搜索和过滤 */}
            <section className="py-8 bg-white border-b">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        {/* 搜索框 */}
                        <div className="w-full md:w-1/3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="搜索创作者..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        ></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* 分类和排序 */}
                        <div className="flex items-center space-x-4">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 bg-white"
                            >
                                {categories.map((category) => (
                                    <option key={category.value} value={category.value}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 bg-white"
                            >
                                <option value="followers">按粉丝数排序</option>
                                <option value="contentCount">按内容数排序</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* 创作者网格 */}
            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-4">
                    {filteredCreators.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredCreators.map((creator) => (
                                <div
                                    key={creator.id}
                                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="h-32 bg-gradient-to-r from-purple-400 to-pink-400"></div>
                                    <div className="p-6 relative">
                                        <div className="absolute -top-12 left-6 w-20 h-20 rounded-full bg-gray-200 border-4 border-white overflow-hidden">
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <svg
                                                    className="w-12 h-12"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                        clipRule="evenodd"
                                                    ></path>
                                                </svg>
                                            </div>
                                        </div>
                                        {creator.featured && (
                                            <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                                                推荐创作者
                                            </div>
                                        )}
                                        <div className="mt-10">
                                            <h3 className="text-xl font-semibold mb-1">
                                                {creator.name}
                                            </h3>
                                            <p className="text-gray-500 text-sm mb-3">
                                                {creator.category}
                                            </p>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                {creator.bio}
                                            </p>
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="text-sm text-gray-600">
                                                    <span className="font-medium">
                                                        {formatNumber(creator.followers)}
                                                    </span>{" "}
                                                    粉丝
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <span className="font-medium">
                                                        {creator.contentCount}
                                                    </span>{" "}
                                                    内容
                                                </div>
                                            </div>
                                            <Link
                                                href={`/creators/${creator.id}`}
                                                className="block w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center rounded-md hover:from-purple-700 hover:to-pink-700 transition-colors"
                                            >
                                                查看主页
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <h3 className="text-xl font-medium text-gray-600 mb-2">
                                没有找到符合条件的创作者
                            </h3>
                            <p className="text-gray-500">请尝试调整筛选条件</p>
                        </div>
                    )}
                </div>
            </section>

            {/* 成为创作者 */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-6">想要成为创作者？</h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        在X-Fans平台上分享您的才华，获得粉丝支持，实现创作自由
                    </p>
                    <Link
                        href="/become-creator"
                        className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium text-center hover:from-purple-700 hover:to-pink-700 transition-colors shadow-lg hover:shadow-xl"
                    >
                        立即申请
                    </Link>
                </div>
            </section>
        </HomeLayout>
    );
}
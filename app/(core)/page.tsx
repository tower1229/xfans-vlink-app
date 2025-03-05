"use client";

import HomeLayout from "./home-layout";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  // 热门创作者数据
  const featuredCreators = [
    {
      id: 1,
      name: "艺术家小明",
      avatar: "/creators/avatar1.jpg",
      category: "数字艺术",
      followers: "12.5K",
    },
    {
      id: 2,
      name: "音乐人小红",
      avatar: "/creators/avatar2.jpg",
      category: "音乐",
      followers: "8.3K",
    },
    {
      id: 3,
      name: "摄影师小蓝",
      avatar: "/creators/avatar3.jpg",
      category: "摄影",
      followers: "15.7K",
    },
    {
      id: 4,
      name: "作家小绿",
      avatar: "/creators/avatar4.jpg",
      category: "写作",
      followers: "9.2K",
    },
  ];

  // 内容类别
  const categories = [
    { name: "艺术", icon: "🎨", color: "bg-purple-100" },
    { name: "音乐", icon: "🎵", color: "bg-blue-100" },
    { name: "摄影", icon: "📷", color: "bg-green-100" },
    { name: "写作", icon: "✍️", color: "bg-yellow-100" },
    { name: "视频", icon: "🎬", color: "bg-red-100" },
    { name: "游戏", icon: "🎮", color: "bg-indigo-100" },
  ];

  // 平台特点
  const features = [
    {
      title: "Web3支付",
      description: "通过Vilink协议接入Web3支付，安全、快速、低手续费。",
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "创作者优先",
      description: "更高的收益分成比例，让创作者获得更多回报。",
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
    {
      title: "粉丝互动",
      description: "提供多种互动方式，增强创作者与粉丝之间的联系。",
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  return (
    <HomeLayout>
      {/* 英雄区域 */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-purple-600/20 to-pink-600/20 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="block">连接创作者与粉丝的</span>
                <span className="bg-linear-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                  新一代内容平台
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-lg">
                X-Fans让创作者通过Web3支付直接从粉丝获得收入，无需中间商，更高收益，更多自由。
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/signup"
                  className="px-8 py-4 rounded-full bg-linear-to-r from-purple-600 to-pink-600 text-white font-medium text-center hover:from-purple-700 hover:to-pink-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  免费注册
                </Link>
                <Link
                  href="/explore"
                  className="px-8 py-4 rounded-full bg-white text-gray-800 font-medium text-center hover:bg-gray-100 transition-colors shadow-md hover:shadow-lg"
                >
                  探索内容
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-linear-to-br from-purple-600/80 to-pink-600/80 mix-blend-overlay"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center p-8">
                    <div className="text-6xl mb-4">🚀</div>
                    <h3 className="text-2xl font-bold mb-2">创作无限可能</h3>
                    <p className="text-white/80">通过X-Fans展示你的才华，连接你的粉丝</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 特点区域 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">为什么选择 X-Fans?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              我们提供最先进的Web3支付解决方案，让创作者获得更多收益，粉丝获得更好体验
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-8 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 热门创作者 */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">热门创作者</h2>
              <p className="text-lg text-gray-600">
                发现平台上最受欢迎的创作者，支持他们的创作
              </p>
            </div>
            <Link
              href="/creators"
              className="text-purple-600 font-medium hover:text-purple-700 transition-colors"
            >
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredCreators.map((creator) => (
              <div
                key={creator.id}
                className="bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="h-40 bg-linear-to-r from-purple-400 to-pink-400"></div>
                <div className="p-6 relative">
                  <div className="absolute -top-12 left-6 w-20 h-20 rounded-full bg-gray-200 border-4 border-white overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="mt-10">
                    <h3 className="text-xl font-semibold mb-1">{creator.name}</h3>
                    <p className="text-gray-500 text-sm mb-3">{creator.category}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{creator.followers} 粉丝</span>
                      <Link
                        href={`/creators/${creator.id}`}
                        className="text-sm text-purple-600 font-medium hover:text-purple-700 transition-colors"
                      >
                        查看主页
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 内容类别 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">探索内容类别</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              X-Fans支持多种内容类型，总有一款适合你
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={`/categories/${category.name}`}
                className={`${category.color} rounded-xl p-6 text-center hover:shadow-md transition-shadow`}
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="text-lg font-medium">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA区域 */}
      <section className="py-20 bg-linear-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            准备好开始你的创作之旅了吗？
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            加入X-Fans，连接你的粉丝，获得更多收益，实现创作自由
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/signup"
              className="px-8 py-4 rounded-full bg-white text-purple-600 font-medium text-center hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
            >
              立即注册
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 rounded-full bg-purple-700/30 text-white font-medium text-center hover:bg-purple-700/40 transition-colors"
            >
              了解更多
            </Link>
          </div>
        </div>
      </section>
    </HomeLayout>
  );
}

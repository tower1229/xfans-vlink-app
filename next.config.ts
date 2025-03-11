import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "./app"),
    };
    return config;
  },
  experimental: {
    turbo: {
      resolveAlias: {
        "@": path.resolve(__dirname, "./app"),
      },
    },
  },
  images: {
    domains: ["xyoss.newaircloud.com", "img.daisyui.com"], // 添加允许的图片域名
  },
};

export default nextConfig;

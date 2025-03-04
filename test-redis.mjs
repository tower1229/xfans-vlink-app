import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
config();

// 设置 Node.js TLS 版本
process.env.NODE_TLS_MIN_VERSION = 'TLSv1.2';
process.env.NODE_TLS_MAX_VERSION = 'TLSv1.3';

import { redis, cacheUtils } from './app/utils/redis.mjs';

async function testRedis() {
    try {
        console.log('测试 Redis 连接...');
        console.log('使用的 Redis URL:', process.env.REDIS_URL);
        console.log('TLS 版本设置:', {
            min: process.env.NODE_TLS_MIN_VERSION,
            max: process.env.NODE_TLS_MAX_VERSION
        });

        // 测试连接
        const isReady = await cacheUtils.isReady();
        console.log('Redis 连接状态:', isReady ? '正常' : '异常');

        if (isReady) {
            // 测试写入
            const testKey = 'test:connection';
            await cacheUtils.set(testKey, { test: 'success' });
            console.log('写入测试数据成功');

            // 测试读取
            const value = await cacheUtils.get(testKey);
            console.log('读取测试数据:', value);

            // 测试删除
            await cacheUtils.del(testKey);
            console.log('删除测试数据成功');
        }
    } catch (error) {
        console.error('测试过程中出现错误:', error);
    } finally {
        // 关闭连接
        await redis.quit();
        console.log('Redis 连接已关闭');
    }
}

testRedis();
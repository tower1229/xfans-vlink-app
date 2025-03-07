import { createClient } from 'redis';
import { config } from 'dotenv';

// 加载环境变量
config();

// 创建 Redis 客户端实例
const redis = createClient({
    url: process.env.REDIS_URL
});

// 错误处理
redis.on('error', err => console.error('Redis 连接错误:', err));
redis.on('connect', () => console.log('Redis 连接成功'));
redis.on('reconnecting', () => console.log('Redis 正在重新连接...'));
redis.on('ready', () => console.log('Redis 准备就绪'));

// 确保 Redis 客户端已连接
let isConnected = false;
const connectRedis = async () => {
    if (!isConnected) {
        try {
            await redis.connect();
            isConnected = true;
        } catch (error) {
            if (error.message !== 'Connection already established') {
                console.error('Redis 连接失败:', error);
                throw error;
            } else {
                isConnected = true;
            }
        }
    }
};

// 初始化连接
connectRedis().catch(console.error);

// 包装常用的 Redis 操作
export const cacheUtils = {
    /**
     * 设置缓存
     * @param {string} key 键
     * @param {any} value 值
     * @param {number} ttl 过期时间（秒）
     */
    async set(key, value, ttl = 60) {
        try {
            await connectRedis();
            const stringValue = JSON.stringify(value);
            if (ttl) {
                await redis.setEx(key, ttl, stringValue);
            } else {
                await redis.set(key, stringValue);
            }
        } catch (error) {
            console.error("设置缓存失败:", error);
            if (process.env.NODE_ENV === "production") {
                // Sentry.captureException(error);
            }
        }
    },

    /**
     * 获取缓存
     * @param {string} key 键
     * @returns {Promise<any>} 缓存值
     */
    async get(key) {
        try {
            await connectRedis();
            const value = await redis.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error("获取缓存失败:", error);
            if (process.env.NODE_ENV === "production") {
                // Sentry.captureException(error);
            }
            return null;
        }
    },

    /**
     * 删除缓存
     * @param {string} key 键
     */
    async del(key) {
        try {
            await connectRedis();
            await redis.del(key);
        } catch (error) {
            console.error("删除缓存失败:", error);
            if (process.env.NODE_ENV === "production") {
                // Sentry.captureException(error);
            }
        }
    },

    /**
     * 设置带过期时间的计数器
     * @param {string} key 键
     * @param {number} ttl 过期时间（秒）
     * @returns {Promise<number>} 当前计数
     */
    async incr(key, ttl = 60) {
        try {
            const multi = redis.multi();
            multi.incr(key);
            multi.expire(key, ttl);
            const results = await multi.exec();
            return results?.[0] || 0;
        } catch (error) {
            console.error("增加计数器失败:", error);
            if (process.env.NODE_ENV === "production") {
                // Sentry.captureException(error);
            }
            return 0;
        }
    },

    /**
     * 检查 Redis 连接状态
     * @returns {boolean} 连接是否正常
     */
    async isReady() {
        try {
            await redis.ping();
            return true;
        } catch (error) {
            console.error("Redis 连接检查失败:", error);
            return false;
        }
    },

    /**
     * 清除所有缓存
     * 警告：此操作将清除所有数据
     */
    async clearAll() {
        try {
            await redis.flushDb();
            console.log("缓存已清除");
        } catch (error) {
            console.error("清除缓存失败:", error);
            if (process.env.NODE_ENV === "production") {
                // Sentry.captureException(error);
            }
        }
    },
};

// 导出 Redis 客户端
export { redis };
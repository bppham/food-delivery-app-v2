// services/cache.service.js
const { redisClient } = require("../../config/redis");

const cacheService = {
    /**
     * 1. Lấy dữ liệu từ Redis
     */
    async get(key) {
        try {
            if (!redisClient.isReady) return null;
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`❌ Cache GET Error [${key}]:`, error.message);
            return null; // Lỗi Redis thì trả null để fallback sang DB, không làm crash app
        }
    },

    /**
     * 2. Lưu dữ liệu vào Redis kèm thời gian sống (TTL)
     */
    async set(key, value, ttl = 300) {
        try {
            if (!redisClient.isReady) return false;
            const serialized = JSON.stringify(value);
            await redisClient.set(key, serialized, { EX: ttl });
            return true;
        } catch (error) {
            console.error(`❌ Cache SET Error [${key}]:`, error.message);
            return false;
        }
    },

    /**
     * 3. Xóa một key cụ thể (khi dữ liệu bị sửa/xóa)
     */
    async del(key) {
        try {
            if (!redisClient.isReady) return false;
            await redisClient.del(key);
            return true;
        } catch (error) {
            console.error(`❌ Cache DEL Error [${key}]:`, error.message);
            return false;
        }
    },

    /**
     * 4. Xóa các key theo pattern (Dùng SCAN an toàn cho production)
     */
    async delByPattern(pattern) {
        try {
            if (!redisClient.isReady) return false;
            let cursor = 0;
            do {
                const reply = await redisClient.scan(cursor, {
                    MATCH: pattern,
                    COUNT: 100,
                });
                cursor = reply.cursor;
                const keys = reply.keys;
                if (keys.length > 0) {
                    await redisClient.del(keys);
                }
            } while (cursor !== 0);
            return true;
        } catch (error) {
            console.error(`❌ Cache DEL Pattern Error [${pattern}]:`, error.message);
            return false;
        }
    },

    /**
     * 5. HÀM QUAN TRỌNG NHẤT: Cache-Aside Wrapper
     * Tự động kiểm tra Cache -> nếu chưa có thì chạy query DB -> lưu Cache -> trả về
     */
    async getOrSet(key, ttl, fetchFunction) {
        // 1. Thử lấy từ Cache
        const cachedData = await this.get(key);
        if (cachedData !== null) {
            console.log(`⚡ [CACHE HIT]: ${key}`);
            return cachedData;
        }

        // 2. Cache Miss: Gọi hàm truy vấn Database
        console.log(`🐢 [CACHE MISS]: ${key} (Fetching from Database...)`);
        const freshData = await fetchFunction();

        // 3. Nếu DB có dữ liệu, lưu ngay vào Cache cho các lần sau
        if (freshData !== null && freshData !== undefined) {
            await this.set(key, freshData, ttl);
        }

        return freshData;
    },
};

module.exports = cacheService;

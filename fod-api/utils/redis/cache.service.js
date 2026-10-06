// services/cache.service.js
const { redisClient } = require("../../config/redis");
const { REDIS_KEYS } = require("../../constants/redisKeys.constant");
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


    // Handle shipper location
    /**
     * 6. Lưu tọa độ GPS của Shipper vào Redis Geospatial
     * (Lưu ý: Redis yêu cầu Kinh độ longitude TRƯỚC, Vĩ độ latitude SAU)
     */
    async updateShipperLocation(shipperId, longitude, latitude) {
        try {
            if (!redisClient.isReady) return false;
            // Lưu tọa độ vào Geospatial Index
            await redisClient.geoAdd(REDIS_KEYS.SHIPPERS_LOCATIONS, {
                longitude: parseFloat(longitude),
                latitude: parseFloat(latitude),
                member: shipperId.toString(),
            });
            // Đặt cờ Heartbeat online 60 giây (tự offline nếu mất kết nối)
            await redisClient.set(REDIS_KEYS.SHIPPER_ONLINE(shipperId), 1, { EX: 60 });
            return true;
        } catch (error) {
            console.error("❌ GeoAdd Error:", error.message);
            return false;
        }
    },
    /**
     * 7. Quét tìm danh sách Shipper trong bán kính (km) quanh tọa độ tâm
     */
    async findNearbyShippers(longitude, latitude, radiusKm = 3) {
        try {
            if (!redisClient.isReady) return [];
            const results = await redisClient.geoSearchWith(
                REDIS_KEYS.SHIPPERS_LOCATIONS,
                { longitude: parseFloat(longitude), latitude: parseFloat(latitude) },
                { radius: radiusKm, unit: 'km' },
                ['WITHDIST', 'WITHCOORD'],
                { SORT: 'ASC' } // Sắp xếp từ gần nhất đến xa nhất
            );
            // Chuẩn hóa kết quả trả về
            return results.map(item => ({
                shipperId: item.member,
                distanceKm: parseFloat(item.distance),
                coordinates: {
                    longitude: parseFloat(item.coordinates.longitude),
                    latitude: parseFloat(item.coordinates.latitude),
                }
            }));
        } catch (error) {
            console.error("❌ GeoSearch Error:", error.message);
            return [];
        }
    },
    /**
     * 8. Xóa shipper khỏi danh sách online khi tài xế tắt app (Offline)
     */
    async removeShipperLocation(shipperId) {
        try {
            if (!redisClient.isReady) return false;
            await redisClient.zRem(REDIS_KEYS.SHIPPERS_LOCATIONS, shipperId.toString());
            await redisClient.del(REDIS_KEYS.SHIPPER_ONLINE(shipperId));
            return true;
        } catch (error) {
            console.error("❌ GeoRemove Error:", error.message);
            return false;
        }
    },

    /**
     * 9. Xin khóa phân tán (Distributed Lock)
     * @param {string} lockKey - Key của khóa (vd: fod:locks:order:123)
     * @param {string} lockValue - Định danh người giữ khóa (shipperId)
     * @param {number} ttlMs - Thời gian giữ khóa tính bằng mili-giây (mặc định 5000ms = 5 giây)
     * @returns {Promise<boolean>} true: lấy được khóa; false: bị người khác chiếm trước
     */
    async acquireLock(lockKey, lockValue, ttlMs = 5000) {
        try {
            if (!redisClient.isReady) return true; // Fallback nếu Redis có sự cố để không chặn nghiệp vụ
            // Lệnh SET ... NX PX: Chỉ set nếu Chưa Tồn Tại, tự hủy sau ttlMs
            const result = await redisClient.set(lockKey, lockValue.toString(), {
                PX: ttlMs,
                NX: true,
            });
            return result === 'OK';
        } catch (error) {
            console.error(`❌ Acquire Lock Error [${lockKey}]:`, error.message);
            return true; // Fallback an toàn cho MongoDB xử lý tiếp
        }
    },

    /**
     * 10. Giải phóng khóa an toàn bằng Lua Script
     * (Đảm bảo chỉ đúng người tạo khóa mới được quyền xóa khóa)
     */
    async releaseLock(lockKey, lockValue) {
        try {
            if (!redisClient.isReady) return false;
            // Script Lua nguyên tử: Kiểm tra giá trị bên trong khớp mới xóa
            const luaScript = `
                if redis.call("get", KEYS[1]) == ARGV[1] then
                    return redis.call("del", KEYS[1])
                else
                    return 0
                end
            `;
            const result = await redisClient.eval(luaScript, {
                keys: [lockKey],
                arguments: [lockValue.toString()],
            });
            return result === 1;
        } catch (error) {
            console.error(`❌ Release Lock Error [${lockKey}]:`, error.message);
            return false;
        }
    },

    // Cron job
    /**
   * Kiểm tra nhanh shipper có đang thực sự online qua Redis Heartbeat không (0.01ms)
   */
    async isShipperOnline(shipperId) {
        try {
            if (!redisClient.isReady) return true; // Fallback an toàn
            const exists = await redisClient.exists(REDIS_KEYS.SHIPPER_ONLINE(shipperId));
            return exists === 1;
        } catch (error) {
            console.error(`❌ Check Shipper Online Error [${shipperId}]:`, error.message);
            return true;
        }
    },

};

module.exports = cacheService;

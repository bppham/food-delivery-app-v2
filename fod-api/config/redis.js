// config/redis.js
const { createClient } = require("redis");

const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = process.env.REDIS_PORT || 6379;
const redisPassword = process.env.REDIS_PASSWORD || undefined;

const redisClient = createClient({
  socket: {
    host: redisHost,
    port: Number(redisPort),
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.warn("⚠️ Redis reconnect: Exceeded max retries. Stop retrying.");
        return new Error("Redis retry limit exhausted");
      }
      const delay = Math.min(retries * 500, 3000);
      console.log(`🔄 Reconnecting to Redis in ${delay}ms... (Attempt ${retries})`);
      return delay;
    },
  },
  password: redisPassword || undefined,
});

redisClient.on("connect", () => {
  console.log(`🔌 Redis Client connecting to ${redisHost}:${redisPort}...`);
});

redisClient.on("ready", () => {
  console.log("✅ Redis Client is ready and connected!");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Client Error:", err.message);
});

redisClient.on("end", () => {
  console.log("⏹️ Redis Client connection closed.");
});

// Hàm khởi tạo kết nối chủ động (gọi trong server.js)
const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error("❌ Could not connect to Redis:", error.message);
    console.warn("⚠️ App will continue running without Redis cache.");
  }
};

module.exports = {
  redisClient,
  connectRedis,
};
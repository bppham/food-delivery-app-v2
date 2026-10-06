const crypto = require("crypto");
const cacheService = require("./redis/cache.service");
const { REDIS_KEYS, REDIS_TTL } = require("../constants/redisKeys.constant");
const ErrorCode = require("../constants/errorCodes.enum");

/**
 * 1. Sinh mã OTP ngẫu nhiên (mặc định 6 chữ số)
 */
const generateRandomOtp = (length = 6) => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * 2. Băm mã OTP bằng SHA256 để bảo mật
 */
const hashOtp = (otp) => {
    return crypto.createHash("sha256").update(otp).digest("hex");
};

/**
 * 3. Tạo OTP, lưu vào Redis kèm Rate Limiting (Chống spam)
 * @param {string} email
 * @returns {Promise<string>} Mã OTP 6 số (plaintext) để gửi qua email
 */
const createAndSaveOtp = async (email, role = "user") => {
    // B1: Kiểm tra chống spam theo từng role
    const isSpamming = await cacheService.get(REDIS_KEYS.OTP_RATE_LIMIT(role, email));
    if (isSpamming) {
        throw {
            status: 429,
            success: false,
            message: "Vui lòng đợi 60 giây trước khi yêu cầu lại mã OTP!",
            code: "TOO_MANY_REQUESTS",
        };
    }
    // B2: Sinh OTP & Hash
    const otp = generateRandomOtp();
    const hashedOtp = hashOtp(otp);
    // B3: Lưu vào Redis theo role
    await cacheService.set(REDIS_KEYS.OTP_FORGOT(role, email), hashedOtp, REDIS_TTL.OTP);
    await cacheService.set(REDIS_KEYS.OTP_RATE_LIMIT(role, email), 1, REDIS_TTL.OTP_RATE_LIMIT);
    return otp;
};

/**
 * 4. Xác thực OTP và cấp Reset Token tạm thời (5 phút)
 * @param {string} email 
 * @param {string} inputOtp 
 * @returns {Promise<{success: boolean, resetToken: string}>}
 */
const verifyOtpAndGenerateResetToken = async (email, inputOtp, role = "user") => {
    const cachedHashedOtp = await cacheService.get(REDIS_KEYS.OTP_FORGOT(role, email));
    if (!cachedHashedOtp) throw ErrorCode.OTP_EXPIRED;
    const hashedInput = hashOtp(inputOtp);
    if (hashedInput !== cachedHashedOtp) throw ErrorCode.INVALID_OTP;

    await cacheService.del(REDIS_KEYS.OTP_FORGOT(role, email));

    const resetToken = crypto.randomBytes(32).toString("hex");
    await cacheService.set(REDIS_KEYS.RESET_TOKEN(resetToken), { email, role }, REDIS_TTL.RESET_TOKEN);
    return { success: true, resetToken };
};

module.exports = {
    generateRandomOtp,
    hashOtp,
    createAndSaveOtp,
    verifyOtpAndGenerateResetToken,
};

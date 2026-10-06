// Thời gian sống (TTL) tính bằng giây
const REDIS_TTL = {
    SHORT: 3 * 60,           // 3 phút
    MEDIUM: 15 * 60,         // 15 phút
    LONG: 24 * 60 * 60,      // 24 giờ
    OTP: 2 * 60,             // 2 phút (OTP tự hủy)
    OTP_RATE_LIMIT: 60,      // 60 giây (Khoảng cách giữa 2 lần gửi mail)
    RESET_TOKEN: 5 * 60,     // 5 phút (Hạn của token để đổi mật khẩu)
};

const REDIS_KEYS = {
    SYSTEM_CATEGORIES: 'fod:categories:all',
    STORE_DETAIL: (storeId) => `fod:stores:${storeId}`,
    STORE_DISHES: (storeId) => `fod:dishes:store:${storeId}`,
    STORE_LIST_PATTERN: 'fod:stores:list:*',

    OTP_FORGOT: (role, email) => `fod:otp:forgot:${role}:${email}`,
    OTP_RATE_LIMIT: (role, email) => `fod:otp:ratelimit:${role}:${email}`,
    RESET_TOKEN: (token) => `fod:reset_token:${token}`,
};

module.exports = {
    REDIS_TTL,
    REDIS_KEYS,
};
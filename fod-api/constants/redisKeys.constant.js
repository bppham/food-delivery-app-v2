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
    STORE_LIST_PATTERN: 'fod:stores:list:*',
    STORE_DISHES: (storeId, category = 'all', page = 1, limit = 10, sortBy = 'name', order = 'asc') =>
        `fod:dishes:store:${storeId}:c_${category}:p_${page}:l_${limit}:s_${sortBy}_${order}`,
    STORE_DISHES_PATTERN: (storeId) => `fod:dishes:store:${storeId}:*`,
    OTP_FORGOT: (role, email) => `fod:otp:forgot:${role}:${email}`,
    OTP_RATE_LIMIT: (role, email) => `fod:otp:ratelimit:${role}:${email}`,
    RESET_TOKEN: (token) => `fod:reset_token:${token}`,




    SHIPPERS_LOCATIONS: 'fod:shippers:locations', // Sorted Set chứa toàn bộ GPS của các shipper
    SHIPPER_ONLINE: (shipperId) => `fod:shippers:online:${shipperId}`, // TTL 60s (Heartbeat)

    ORDER_LOCK: (orderId) => `fod:order:lock:${orderId}`, // Lock đảm bảo chỉ 1 tài xế nhận đơn cùng lúc
};

module.exports = {
    REDIS_TTL,
    REDIS_KEYS,
};
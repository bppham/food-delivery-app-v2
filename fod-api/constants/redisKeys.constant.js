// Thời gian sống (TTL) tính bằng giây
const REDIS_TTL = {
    SHORT: 3 * 60,           // 3 phút: dữ liệu biến động nhanh (vị trí, rating,...)
    MEDIUM: 15 * 60,         // 15 phút: danh sách món ăn, thông tin quán
    LONG: 24 * 60 * 60,      // 24 giờ: danh mục hệ thống, tag ít khi thay đổi
};

const REDIS_KEYS = {
    SYSTEM_CATEGORIES: 'fod:categories:all',
    STORE_DETAIL: (storeId) => `fod:stores:${storeId}`,
    STORE_DISHES: (storeId) => `fod:dishes:store:${storeId}`,
};

module.exports = {
    REDIS_TTL,
    REDIS_KEYS,
};
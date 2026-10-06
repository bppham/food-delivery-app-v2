const SystemCategory = require("../models/system_categories.model");
const Store = require("../models/stores.model");
const ErrorCode = require("../constants/errorCodes.enum");
const cacheService = require("../utils/redis/cache.service");
const { REDIS_KEYS, REDIS_TTL } = require("../constants/redisKeys.constant");

const getAllSystemCategoryService = async () => {
  const cacheData = await cacheService.get(REDIS_KEYS.SYSTEM_CATEGORIES);
  if (cacheData) {
    return cacheData;
  }
  const data = await SystemCategory.find().populate("image");

  await cacheService.set(REDIS_KEYS.SYSTEM_CATEGORIES, data, REDIS_TTL.LONG);
  return data;
};


const getAllSystemCategoriesWithStoreCountService = async () => {
  // 1. Kiểm tra cache ngắn hạn (3 phút)
  const cacheKey = "fod:categories:with_count";
  const cachedData = await cacheService.get(cacheKey);
  if (cachedData) return cachedData;

  // 2. Query và đếm từ MongoDB
  const categories = await SystemCategory.find().populate("image");
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const storeCount = await Store.countDocuments({
        systemCategoryId: category._id,
      });
      return {
        _id: category._id,
        name: category.name,
        image: category.image,
        storeCount,
      };
    })
  );

  // 3. Lưu cache 3 phút
  await cacheService.set(cacheKey, categoriesWithCount, REDIS_TTL.SHORT);

  return categoriesWithCount;
};


const getSystemCategoryByIdService = async (id) => {
  if (!id) throw ErrorCode.SYSTEM_CATEGORY_NOT_FOUND;

  const category = await SystemCategory.findById(id).populate("image");
  if (!category) throw ErrorCode.SYSTEM_CATEGORY_NOT_FOUND;

  return category;
};

const createSystemCategoryService = async (body) => {
  const { name, image } = body || {};
  if (!name || typeof name !== "string") {
    throw ErrorCode.INVALID_SYSTEM_CATEGORY_NAME;
  }
  if (!image) {
    throw ErrorCode.INVALID_SYSTEM_CATEGORY_IMAGE;
  }
  const exists = await SystemCategory.findOne({ name });
  if (exists) {
    throw ErrorCode.SYSTEM_CATEGORY_ALREADY_EXISTS;
  }

  const newCategory = await SystemCategory.create({ name, image });
  return newCategory;
};

const updateSystemCategoryService = async (id, payload) => {
  if (!id) throw ErrorCode.SYSTEM_CATEGORY_NOT_FOUND;

  const category = await SystemCategory.findById(id);
  if (!category) throw ErrorCode.SYSTEM_CATEGORY_NOT_FOUND;

  const { name, image } = payload || {};

  // Nếu đổi tên, kiểm tra hợp lệ và không trùng
  if (name && name !== category.name) {
    if (typeof name !== "string" || name.trim() === "") {
      throw ErrorCode.INVALID_SYSTEM_CATEGORY_NAME;
    }
    const exists = await SystemCategory.findOne({ name });
    if (exists) {
      throw ErrorCode.SYSTEM_CATEGORY_ALREADY_EXISTS;
    }
    category.name = name;
  }

  if (image) {
    category.image = image;
  }

  const updatedCategory = await category.save();
  return updatedCategory;
};

const deleteSystemCategoryService = async (id) => {
  if (!id) throw ErrorCode.SYSTEM_CATEGORY_NOT_FOUND;

  const storeCount = await Store.countDocuments({ systemCategoryId: id });
  if (storeCount > 0) {
    throw ErrorCode.CAN_NOT_DELETE_SYSTEM_CATEGORY();
  }

  const deleted = await SystemCategory.findByIdAndDelete(id);
  return deleted;
};

module.exports = {
  getAllSystemCategoryService,
  getAllSystemCategoriesWithStoreCountService,
  getSystemCategoryByIdService,
  createSystemCategoryService,
  updateSystemCategoryService,
  deleteSystemCategoryService,
};
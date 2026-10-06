const mongoose = require('mongoose');
const cacheService = require('../utils/redis/cache.service');
const { REDIS_KEYS } = require('../constants/redisKeys.constant');
const { Schema } = mongoose;

const SystemCategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  image: { type: Schema.Types.ObjectId, ref: 'images' },
}, {
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

SystemCategorySchema.virtual('images', {
  ref: 'images',
  localField: 'image',
  foreignField: '_id',
  justOne: true
});

const clearCategoryCache = async () => {
  console.log("[SYSTEM CATEGORY HOOK] Auto clearing system categories cache");
  await cacheService.del(REDIS_KEYS.SYSTEM_CATEGORIES);
};

SystemCategorySchema.post("save", clearCategoryCache);
SystemCategorySchema.post("findOneAndUpdate", clearCategoryCache);
SystemCategorySchema.post("findOneAndDelete", clearCategoryCache);


module.exports = mongoose.model('system_categories', SystemCategorySchema);
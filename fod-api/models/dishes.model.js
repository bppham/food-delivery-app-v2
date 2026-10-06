const mongoose = require("mongoose");
const cacheService = require("../utils/redis/cache.service");
const { REDIS_KEYS } = require("../constants/redisKeys.constant");
const { Schema } = mongoose;

const DishSchema = new Schema(
  {
    name: { type: String, required: true },
    dishTags: [{ type: Schema.Types.ObjectId, ref: "food_tags" }],
    tasteTags: [{ type: Schema.Types.ObjectId, ref: "taste_tags" }],
    cookingMethodtags: [
      { type: Schema.Types.ObjectId, ref: "cooking_method_tags" },
    ],
    cultureTags: [{ type: Schema.Types.ObjectId, ref: "culture_tags" }],
    price: { type: Number, required: true },
    category: { type: Schema.Types.ObjectId, ref: "categories" },
    storeId: { type: Schema.Types.ObjectId, ref: "stores", required: true },
    image: { type: Schema.Types.ObjectId, ref: "images" },
    description: { type: String },

    deleted: { type: Boolean, default: false },

    stockStatus: {
      type: String,
      required: true,
      default: "out_of_stock",
      enum: ["available", "out_of_stock"],
    },
    stockCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

DishSchema.virtual("stores", {
  ref: "stores",
  localField: "storeId",
  foreignField: "_id",
  justOne: true,
});

DishSchema.virtual("categories", {
  ref: "categories",
  localField: "category",
  foreignField: "_id",
  justOne: true,
});


const clearMenuCache = async (storeId) => {
  if (storeId) {
    console.log(`[DISH HOOK] Auto clearing menu cache for store: ${storeId}`);
    await cacheService.delByPattern(REDIS_KEYS.STORE_DISHES_PATTERN(storeId));
  }
}

DishSchema.post("save", async function (doc) {
  await clearMenuCache(doc?.storeId);
});

DishSchema.post("findOneAndUpdate", async function (doc) {
  await clearMenuCache(doc?.storeId);
});

DishSchema.post("findOneAndDelete", async function (doc) {
  await clearMenuCache(doc?.storeId);
});

module.exports = mongoose.model("dishes", DishSchema);

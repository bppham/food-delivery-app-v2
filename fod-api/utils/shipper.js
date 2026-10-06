const Shipper = require("../models/shippers.model");
const cacheService = require("./redis/cache.service");

const findNearestShipper = async (
  storeLat,
  storeLon,
  excludedShippers = [],
  maxDistanceKm = 5 // Quét trong bán kính 5km
) => {
  if (!storeLat || !storeLon) throw new Error("Missing store coordinates");

  // 1️⃣ Dùng Redis GeoSearch quét toàn bộ tài xế gần quán (đã sắp xếp ASC từ gần đến xa)
  const nearbyShippers = await cacheService.findNearbyShippers(
    storeLon,
    storeLat,
    maxDistanceKm
  );

  if (!nearbyShippers.length) return null;

  // 2️⃣ Loại bỏ shipper đã từ chối đơn VÀ kiểm tra Heartbeat 60s trên Redis
  const excludedIds = excludedShippers.map((id) => id.toString());
  const validCandidates = [];

  for (const item of nearbyShippers) {
    if (excludedIds.includes(item.shipperId)) continue;

    // Kiểm tra tài xế có thực sự online không (kiểm tra key TTL 60s trên Redis)
    const isOnline = await cacheService.isShipperOnline(item.shipperId);
    if (!isOnline) {
      // Tiện tay dọn dẹp luôn tài xế đã mất mạng / tắt app khỏi Redis Geospatial
      await cacheService.removeShipperLocation(item.shipperId);
      continue;
    }

    validCandidates.push(item);
  }

  if (!validCandidates.length) return null;

  // 3️⃣ Tìm các shipper đang rảnh (busy: false) trong danh sách ứng viên từ MongoDB
  const candidateIds = validCandidates.map((item) => item.shipperId);
  const activeShippers = await Shipper.find({
    _id: { $in: candidateIds },
    online: true,
    busy: false,
  }).lean();

  if (!activeShippers.length) return null;

  // Tạo Map để tra cứu O(1)
  const activeShipperMap = new Map(
    activeShippers.map((s) => [s._id.toString(), s])
  );

  // 4️⃣ Duyệt theo đúng thứ tự gần nhất của Redis: Người đầu tiên khớp CHẮC CHẮN là người gần quán nhất!
  for (const candidate of validCandidates) {
    const shipper = activeShipperMap.get(candidate.shipperId);
    if (shipper) {
      return {
        ...shipper,
        distanceKm: candidate.distanceKm, // Gắn khoảng cách chính xác tính bằng km
      };
    }
  }

  return null;
};

module.exports = { findNearestShipper };

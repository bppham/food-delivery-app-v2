// test_geo.js
const { redisClient } = require("../config/redis");
const cacheService = require("../utils/redis/cache.service");

async function testGeospatial() {
    console.log("🚀 Đang khởi động test Redis Geospatial...\n");

    // Giả lập 1 Quán ăn tại: Phố đi bộ Nguyễn Huệ, Quận 1
    const store = {
        name: "Quán Ăn Phố Đi Bộ (Q.1)",
        lat: 10.7744,
        lon: 106.7032,
    };

    // Giả lập 4 Tài xế đang ở các vị trí thực tế tại TP.HCM:
    const mockShippers = [
        { id: "shipper_A_BenThanh", name: "Tài xế A (Chợ Bến Thành, Q.1)", lat: 10.7725, lon: 106.6980 },
        { id: "shipper_B_DucBa", name: "Tài xế B (Nhà thờ Đức Bà, Q.1)", lat: 10.7798, lon: 106.6990 },
        { id: "shipper_C_Landmark", name: "Tài xế C (Landmark 81, Bình Thạnh)", lat: 10.7951, lon: 106.7218 },
        { id: "shipper_D_SanBay", name: "Tài xế D (Sân bay Tân Sơn Nhất)", lat: 10.8184, lon: 106.6588 },
    ];

    // 1️⃣ Bắn tọa độ của cả 4 tài xế vào Redis
    console.log("📍 1. Đang nạp tọa độ GPS của 4 tài xế vào Redis...");
    for (const s of mockShippers) {
        await cacheService.updateShipperLocation(s.id, s.lon, s.lat);
        console.log(`   + [Đã nạp] ${s.name}`);
    }

    // 2️⃣ Quán ăn phát lệnh tìm tài xế trong Bán kính 3km quanh quán
    console.log(`\n🔍 2. Quán ăn phát lệnh quét tìm tài xế trong bán kính 3km quanh [Kinh độ: ${store.lon}, Vĩ độ: ${store.lat}]...`);
    const nearbyShippers = await cacheService.findNearbyShippers(store.lon, store.lat, 3); // bán kính 3km

    // 3️⃣ In bảng kết quả trực quan
    console.log("\n🎯 KẾT QUẢ QUÉT TỪ REDIS GEOSPATIAL:");
    if (nearbyShippers.length === 0) {
        console.log("❌ Không tìm thấy tài xế nào trong bán kính 3km!");
    } else {
        console.table(
            nearbyShippers.map((r, index) => ({
                "Thứ tự ưu tiên": index + 1,
                "Mã Shipper": r.shipperId,
                "Khoảng cách tới Quán": `${r.distanceKm.toFixed(2)} km`,
            }))
        );
    }

    console.log("\n💡 Nhận xét kết quả:");
    console.log("- Tài xế A (Chợ Bến Thành) gần nhất (~0.61 km) ➔ Được ưu tiên nhận đơn số 1.");
    console.log("- Tài xế B (Nhà thờ Đức Bà) gần nhì (~0.76 km) ➔ Dự phòng số 2.");
    console.log("- Tài xế C (Landmark cách ~3.2km) và Tài xế D (Sân bay cách ~6.8km) ➔ Đã tự động bị loại vì ngoài bán kính 3km!");

    process.exit(0);
}

testGeospatial();

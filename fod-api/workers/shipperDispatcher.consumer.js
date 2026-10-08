const { getChannel } = require("../config/rabbitmq");
const { RABBIT_QUEUES } = require("../constants/rabbitmq.constant");
const Order = require("../models/orders.model");
const Store = require("../models/stores.model");
const { findNearestShipper } = require("../utils/shipper");
const { getIo, getUserSockets } = require("../utils/socketManager");

const startShipperDispatcherConsumer = async () => {
    const channel = getChannel();
    if (!channel) return;

    try {
        await channel.prefetch(5);
        console.log(`👷 [SHIPPER DISPATCHER] Đang lắng nghe hàng đợi: ${RABBIT_QUEUES.ORDER_SHIPPER_DISPATCH}...`);

        channel.consume(
            RABBIT_QUEUES.ORDER_SHIPPER_DISPATCH,
            async (msg) => {
                if (!msg) return;

                try {
                    const { orderId, storeId } = JSON.parse(msg.content.toString());
                    console.log(`🛵 [SHIPPER DISPATCHER] Đang tìm tài xế gần quán cho đơn: ${orderId}`);

                    const order = await Order.findById(orderId);
                    if (!order) {
                        console.warn(`⚠️ Không tìm thấy đơn hàng ${orderId}`);
                        return channel.ack(msg);
                    }

                    // Nếu đơn đã có tài xế nhận hoặc không còn ở trạng thái finished -> bỏ qua
                    if (order.status !== "finished" || order.shipperId) {
                        console.log(`ℹ️ Đơn ${orderId} đã có shipper hoặc không cần tìm nữa.`);
                        return channel.ack(msg);
                    }

                    const store = await Store.findById(storeId || order.storeId);
                    if (!store) {
                        console.warn(`⚠️ Không tìm thấy quán ăn cho đơn ${orderId}`);
                        return channel.ack(msg);
                    }

                    // Hỗ trợ cả 2 định dạng tọa độ { lat, lon } hoặc GeoJSON [lon, lat]
                    const storeLat = store.location?.lat || store.location?.coordinates?.[1];
                    const storeLon = store.location?.lon || store.location?.coordinates?.[0];

                    if (!storeLat || !storeLon) {
                        console.warn(`⚠️ Quán ${store.name} chưa cập nhật tọa độ GPS!`);
                        return channel.ack(msg);
                    }

                    const excludeList = [
                        ...(order.excludedShippers || []),
                        ...(order.alreadysendNoti || []),
                    ];

                    // 1. Quét tìm tài xế gần nhất bằng Redis Geospatial (đã tối ưu ở Giai đoạn 1)
                    const availableShipper = await findNearestShipper(
                        storeLat,
                        storeLon,
                        excludeList
                    );

                    if (availableShipper) {
                        const io = getIo();
                        const userSockets = getUserSockets();

                        // 2. Bắn Socket thông báo riêng cho tài xế đó
                        if (userSockets[availableShipper._id]) {
                            userSockets[availableShipper._id].forEach((socketId) => {
                                io.to(socketId).emit("newOrderAvailable", {
                                    orderId: order._id,
                                    store: store.name,
                                    status: order.status,
                                    location: { lat: storeLat, lon: storeLon },
                                    message: "Có đơn hàng mới gần bạn!",
                                });
                            });
                        }

                        // 3. Đánh dấu tài xế này đã được thông báo
                        if (!order.alreadysendNoti) order.alreadysendNoti = [];
                        if (!order.alreadysendNoti.includes(availableShipper._id)) {
                            order.alreadysendNoti.push(availableShipper._id);
                            await order.save();
                        }

                        console.log(`✅ [SHIPPER DISPATCHER] Đã điều phối đơn ${order._id} tới Shipper ${availableShipper._id} (cách ${availableShipper.distanceKm} km)`);
                    } else {
                        console.log(`⚠️ [SHIPPER DISPATCHER] Chưa tìm thấy tài xế khả dụng quanh quán ${store.name}`);
                    }

                    channel.ack(msg);
                } catch (error) {
                    console.error("❌ [SHIPPER DISPATCHER] Lỗi điều phối:", error.message);
                    channel.nack(msg, false, false);
                }
            },
            { noAck: false }
        );
    } catch (error) {
        console.error("❌ Lỗi khởi động Shipper Dispatcher Consumer:", error.message);
    }
};

module.exports = { startShipperDispatcherConsumer };

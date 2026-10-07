const nodemailer = require("nodemailer");
const { getChannel } = require("../config/rabbitmq");
const { RABBIT_QUEUES } = require("../constants/rabbitmq.constant");
const User = require("../models/users.model");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
    },
});

const startOrderInvoiceConsumer = async () => {
    const channel = getChannel();
    if (!channel) return;

    try {
        await channel.prefetch(5);
        console.log(`👷 [INVOICE WORKER] Đang lắng nghe hàng đợi: ${RABBIT_QUEUES.ORDER_EMAIL_INVOICE}...`);

        channel.consume(
            RABBIT_QUEUES.ORDER_EMAIL_INVOICE,
            async (msg) => {
                if (!msg) return;

                try {
                    const order = JSON.parse(msg.content.toString());
                    console.log(`🧾 [INVOICE WORKER] Nhận sự kiện Đặt hàng thành công: Đơn #${order.orderNumber}`);

                    // Tìm email của khách hàng
                    const user = await User.findById(order.userId);
                    const customerEmail = user?.email || order.customerEmail;

                    if (!customerEmail) {
                        console.warn(`⚠️ Không tìm thấy email của user ${order.userId}, bỏ qua gửi mail.`);
                        return channel.ack(msg);
                    }

                    // Soạn danh sách món ăn dưới dạng bảng HTML
                    const itemsHtml = (order.items || [])
                        .map(
                            (item) => `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.price.toLocaleString("vi-VN")} đ</td>
              </tr>
            `
                        )
                        .join("");

                    const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
              <h2 style="color: #27ae60; text-align: center;">🎉 ĐẶT HÀNG THÀNH CÔNG!</h2>
              <p>Xin chào <strong>${order.customerName || "Quý khách"}</strong>,</p>
              <p>Đơn hàng <strong>#${order.orderNumber}</strong> của bạn từ quán <strong>${order.storeName}</strong> đã được tiếp nhận và đang được chuẩn bị!</p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;" />
              
              <h3 style="color: #333;">Chi tiết đơn hàng:</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                <thead>
                  <tr style="background-color: #f8f9fa;">
                    <th style="padding: 8px; text-align: left;">Món ăn</th>
                    <th style="padding: 8px; text-align: center;">Số lượng</th>
                    <th style="padding: 8px; text-align: right;">Giá</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="text-align: right; line-height: 1.8;">
                <p>Tạm tính: <strong>${(order.subtotalPrice || 0).toLocaleString("vi-VN")} đ</strong></p>
                <p>Phí giao hàng: <strong>${(order.shippingFee || 0).toLocaleString("vi-VN")} đ</strong></p>
                <p>Giảm giá: <strong>-${(order.totalDiscount || 0).toLocaleString("vi-VN")} đ</strong></p>
                <h3 style="color: #e74c3c;">Tổng thanh toán: ${(order.finalTotal || 0).toLocaleString("vi-VN")} đ</h3>
              </div>

              <div style="background-color: #f8f9fa; padding: 12px; border-radius: 6px; margin-top: 15px;">
                <p style="margin: 4px 0;"><strong>📍 Địa chỉ giao hàng:</strong> ${order.deliveryAddress}</p>
                <p style="margin: 4px 0;"><strong>💳 Phương thức thanh toán:</strong> ${order.paymentMethod?.toUpperCase()}</p>
              </div>

              <p style="text-align: center; color: #888; font-size: 13px; margin-top: 25px;">Cảm ơn bạn đã sử dụng dịch vụ đặt đồ ăn của chúng tôi!</p>
            </div>
          `;

                    // Gửi email hóa đơn
                    await transporter.sendMail({
                        from: "Food ordering app",
                        to: customerEmail,
                        subject: `[FOD] Xác nhận đơn hàng #${order.orderNumber} thành công!`,
                        html: emailHtml,
                    });

                    console.log(`✅ [INVOICE WORKER] Đã gửi Email Hóa đơn tới: ${customerEmail}`);
                    channel.ack(msg);
                } catch (error) {
                    console.error("❌ [INVOICE WORKER] Lỗi khi xử lý hóa đơn:", error.message);
                    channel.nack(msg, false, false);
                }
            },
            { noAck: false }
        );
    } catch (error) {
        console.error("❌ Lỗi khởi động Invoice Consumer:", error.message);
    }
};

module.exports = { startOrderInvoiceConsumer };

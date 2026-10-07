const nodemailer = require("nodemailer")
const { getChannel } = require("../config/rabbitmq")
const { RABBIT_QUEUES } = require("../constants/rabbitmq.constant")

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
    },
})

const startEmailConsumer = async () => {
    const channel = getChannel();
    if (!channel) {
        console.error("❌ Không thể khởi động Email Consumer vì Channel chưa sẵn sàng!");
        return;
    }
    try {
        await channel.prefetch(5);
        console.log(`👷 [EMAIL WORKER] Đang lắng nghe hàng đợi: ${RABBIT_QUEUES.EMAIL_OTP}...`);
        channel.consume(
            RABBIT_QUEUES.EMAIL_OTP,
            async (msg) => {
                if (!msg) return;
                let emailData = null;
                try {
                    emailData = JSON.parse(msg.content.toString());
                    console.log(`📩 [EMAIL WORKER] Nhận yêu cầu gửi mail tới: ${emailData.to} - Tiêu đề: "${emailData.subject}"`);
                    await transporter.sendMail({
                        from: "Food ordering app",
                        to: emailData.to,
                        subject: emailData.subject,
                        text: emailData.text,
                        html: emailData.html,
                    });
                    console.log(`✅ [EMAIL WORKER] Đã gửi mail THÀNH CÔNG tới: ${emailData.to}`);
                    // 3. XÁC NHẬN ACK: Báo cho RabbitMQ biết đã làm xong -> Xóa tin nhắn khỏi Queue
                    channel.ack(msg);
                } catch (error) {
                    console.error(`❌ [EMAIL WORKER] Lỗi khi gửi mail tới ${emailData?.to}:`, error.message);
                    // 4. Nếu lỗi nặng: Báo NACK để không làm tắc nghẽn Queue (requeue: false)
                    channel.nack(msg, false, false);
                }
            },
            {
                noAck: false, // BẮT BUỘC false: Chỉ xóa tin nhắn khi Worker đã gọi channel.ack()
            }
        );
    } catch (error) {
        console.error("❌ Lỗi khi khởi động Email Consumer:", error.message);
    }
};
module.exports = { startEmailConsumer };
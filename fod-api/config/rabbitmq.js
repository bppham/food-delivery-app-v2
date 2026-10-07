const amqp = require("amqplib");
const { RABBIT_EXCHANGES, RABBIT_QUEUES, RABBIT_ROUTING_KEYS } = require("../constants/rabbitmq.constant")

let connection = null
let channel = null

const connectRabbitMQ = async () => {
    const amqpUrl = process.env.RABBITMQ_URL

    try {
        console.log("🔌 Đang kết nối tới RabbitMQ...");
        connection = await amqp.connect(amqpUrl);
        channel = await connection.createChannel()

        // 1. Tạo Direct Exchange (durable: true để không mất khi restart RabbitMQ)
        await channel.assertExchange(RABBIT_EXCHANGES.NOTIFICATION, "direct", {
            durable: true
        })

        // 2. Tạo Queue nhận email
        await channel.assertQueue(RABBIT_QUEUES.EMAIL_OTP, {
            durable: true,
        });


        // 3. Nối (Bind) Queue vào Exchange với Routing Key tương ứng
        await channel.bindQueue(RABBIT_QUEUES.EMAIL_OTP, RABBIT_EXCHANGES.NOTIFICATION, RABBIT_ROUTING_KEYS.EMAIL_OTP)

        console.log("✅ RabbitMQ đã kết nối & khởi tạo Exchange/Queue thành công!");

        connection.on("error", (err) => {
            console.error("❌ RabbitMQ Connection Error:", err.message);
        });

        connection.on("close", () => {
            console.warn("⚠️ RabbitMQ Connection bị đóng. Thử kết nối lại sau 5s...");
            setTimeout(connectRabbitMQ, 5000);
        });

        return channel
    } catch (error) {
        console.error("❌ Không thể kết nối tới RabbitMQ:", error.message);
        console.warn("⚠️ Thử kết nối lại sau 5s...");
        setTimeout(connectRabbitMQ, 5000);
        return null;
    }
}

/**
 * Hàm Producer: Đẩy message vào Exchange kèm Routing Key
 * @param {string} exchange - Tên Exchange
 * @param {string} routingKey - Routing key định tuyến
 * @param {object} message - Dữ liệu cần gửi (Object)
 */
const publishMessage = async (exchange, routingKey, message) => {
    try {
        if (!channel) {
            console.warn("⚠️ RabbitMQ channel chưa sẵn sàng!");
            return false;
        }
        // persistent: true đảm bảo message được lưu xuống đĩa, không mất khi restart
        const sent = channel.publish(
            exchange,
            routingKey,
            Buffer.from(JSON.stringify(message)),
            { persistent: true }
        );
        return sent;
    } catch (error) {
        console.error("❌ Publish message error:", error.message);
        return false;
    }
};


const getChannel = () => channel;
module.exports = {
    connectRabbitMQ,
    publishMessage,
    getChannel,
};
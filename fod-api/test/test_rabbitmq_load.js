require("dotenv").config();
const { connectRabbitMQ, publishMessage } = require("../config/rabbitmq");
const {
    RABBIT_EXCHANGES,
    RABBIT_ROUTING_KEYS,
} = require("../constants/rabbitmq.constant");

async function spamTest() {
    console.log("🚀 Bắt đầu bài test bắn tải (Spam 20 Messages vào RabbitMQ)...");
    await connectRabbitMQ();

    const startTime = Date.now();
    const TOTAL_MESSAGES = 20;

    for (let i = 1; i <= TOTAL_MESSAGES; i++) {
        await publishMessage(
            RABBIT_EXCHANGES.NOTIFICATION,
            RABBIT_ROUTING_KEYS.EMAIL_OTP,
            {
                to: `test_user_${i}@example.com`,
                subject: `Test Load RabbitMQ #${i}`,
                text: `Nội dung test số ${i}`,
            }
        );
        console.log(`+ [Đã bắn] Message #${i}`);
    }

    const duration = Date.now() - startTime;
    console.log(`\n🎉 ĐÃ BẮN XONG CẢ 20 MESSAGES CHỈ TRONG: ${duration}ms!`);
    console.log("👉 Hãy nhìn ngay vào Web Dashboard http://localhost:15672 để thấy đồ thị vọt lên đỉnh!");

    setTimeout(() => process.exit(0), 1000);
}

spamTest();

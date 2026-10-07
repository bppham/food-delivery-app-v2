const nodemailer = require("nodemailer");
const { publishMessage, getChannel } = require("../config/rabbitmq");
const {
  RABBIT_EXCHANGES,
  RABBIT_ROUTING_KEYS,
} = require("../constants/rabbitmq.constant");

const sendEmail = async (data, req, res) => {
  const channel = getChannel()

  // 1. NẾU CÓ RABBITMQ: Bắn message vào Queue siêu tốc (1ms)
  if (channel) {
    const isPublished = await publishMessage(
      RABBIT_EXCHANGES.NOTIFICATION,
      RABBIT_ROUTING_KEYS.EMAIL_OTP,
      data
    );
    if (isPublished) {
      console.log(`🚀 [PRODUCER] Đã đẩy email tới ${data.to} vào RabbitMQ thành công!`);
      return { success: true, queued: true };
    }
  }

  console.warn("⚠️ RabbitMQ chưa sẵn sàng, đang fallback gửi trực tiếp...");
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASS,
    },
  });

  await transporter.sendMail({
    from: "Food ordering app",
    to: data.to,
    subject: data.subject,
    text: data.text,
    html: data.html,
  });
};

module.exports = sendEmail;

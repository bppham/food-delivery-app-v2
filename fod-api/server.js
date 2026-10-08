require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db_connection");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const http = require("http");
const socketIo = require("socket.io");
const { setSocketIo, getUserSockets } = require("./utils/socketManager");
const { connectRabbitMQ } = require("./config/rabbitmq");
const { startEmailConsumer } = require("./workers/email.consumer");
const { startOrderInvoiceConsumer } = require("./workers/orderInvoice.consumer");
const Notification = require("./models/notifications.model");

// Route import
const authRoute = require("./routes/auth.route");
const cartRoute = require("./routes/cart.route");
const adminRoute = require("./routes/admin.routes");
const authAdminRoute = require("./routes/auth.admin.routes");
const authStaffRoute = require("./routes/auth.staff.routes");
const authShipperRoute = require("./routes/auth.shipper.route");
const voucherRoute = require("./routes/voucher.routes");
const staffRoute = require("./routes/staff.routes");
const uploadRoute = require("./routes/upload.routes");
const userRoute = require("./routes/user.route");
const favoriteRoute = require("./routes/favorite.routes");
const orderRoute = require("./routes/order.route");
const paymentRoute = require("./routes/payment.route");
const storeRoute = require("./routes/store.route");
const ratingRoute = require("./routes/rating.routes");
const systemCategoryRoute = require("./routes/systemCategory.routes");
const notificationRoute = require("./routes/notification.routes");
const locationRoute = require("./routes/location.routes");
const shippingFeeRoute = require("./routes/shippingFee.routes");
const categoryRoute = require("./routes/category.route");
const toppingGroupRoute = require("./routes/toppingGroup.route");
const toppingRoute = require("./routes/topping.route");
const dishRoute = require("./routes/dish.route");
const tagsRoute = require("./routes/tags.routes");
const statisticsStoreRoute = require("./routes/statistics.store.route");
const statisticsAdminRoute = require("./routes/statistics.admin.route");
const shipperRoute = require("./routes/shipper.route");
const recommendRoute = require("./routes/recommendation.routes");
const userReferenceRoute = require("./routes/userReference.route");
const reportRoute = require("./routes/report.routes");
const { connectRedis } = require("./config/redis");

const app = express();
connectDB();
connectRedis();
connectRabbitMQ().then(() => {
  startEmailConsumer();
  startOrderInvoiceConsumer();
});

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    time: new Date().toISOString(),
  });
});

app.use(morgan("dev"));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
      "http://192.168.1.10:300",
    ],
    credentials: true,
  })
);

// Middleware to parse JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// require("./crons/shipper_online.cron");
require("./crons/ai.cron");

PORT = process.env.PORT || 5000;

// Handle log - Middleware này phải đặt trước các routes
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    const log = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

    sendLogToUI(log); // gửi sang UI SSE
    console.log(log); // log ra console bình thường
  });

  next();
});

// Route
app.use("/api/v1/auth", authRoute);

// Cart
app.use("/api/v1/cart", cartRoute);

// Order
app.use("/api/v1/order", orderRoute);

// Payment
app.use("/api/v1/payment", paymentRoute);

// Favorite
app.use("/api/v1/favorite", favoriteRoute);
// Admin
app.use("/api/v1/auth/admin", authAdminRoute);
// Staff
app.use("/api/v1/auth/staff", authStaffRoute);
// Auth shipper
app.use("/api/v1/auth/shipper", authShipperRoute);

app.use("/api/v1/admin", adminRoute);

// Store
app.use("/api/v1/staff", staffRoute);

// Voucher
app.use("/api/v1/voucher", voucherRoute);

// Upload Firebase
app.use("/api/v1/upload", uploadRoute);

// Store
app.use("/api/v1/store", storeRoute);
// User
app.use("/api/v1/user", userRoute);

// System Category
app.use("/api/v1/system-categories", systemCategoryRoute);

// Rating
app.use("/api/v1/rating", ratingRoute);

// Notification
app.use("/api/v1/notification", notificationRoute);

// Location
app.use("/api/v1/location", locationRoute);

// Shipping Fee
app.use("/api/v1/shipping-fee", shippingFeeRoute);
// Category
app.use("/api/v1/category", categoryRoute);
// Topping group
app.use("/api/v1/topping-group", toppingGroupRoute);
// Topping
app.use("/api/v1/topping", toppingRoute);
// Dish
app.use("/api/v1/dish", dishRoute);
// Dish
app.use("/api/v1/tags", tagsRoute);
// Store statistic
app.use("/api/v1/statistics/store", statisticsStoreRoute);
// Admin statistic
app.use("/api/v1/statistics/admin", statisticsAdminRoute);
// Shipper
app.use("/api/v1/shipper", shipperRoute);
// Recommend AI
app.use("/api/v1/recommend", recommendRoute);

// User refference
app.use("/api/v1/reference", userReferenceRoute);
// Report
app.use("/api/v1/report", reportRoute);

// Gửi log tới UI
function sendLogToUI(log) {
  logClients.forEach((client) => {
    client.write(`data: ${log}\n\n`);
  });
}

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });
const { getStoreSockets } = require("./utils/socketManager");
const storeSockets = getStoreSockets();
setSocketIo(io); // Make io accessible everywhere
const userSockets = getUserSockets();

io.on("connection", (socket) => {
  socket.on("registerUser", async (userId) => {
    // Nếu userId chưa có trong userSockets, tạo mảng mới
    if (!userSockets[userId]) {
      userSockets[userId] = [];
    }

    // Thêm socket id vào mảng của user
    userSockets[userId].push(socket.id);

    console.log(`User ${userId} connected with socket ID: ${socket.id}`);

    // Khi user kết nối, lấy tất cả thông báo của họ
    try {
      const allNotifications = await Notification.find({ userId }).sort({
        createdAt: -1,
      });
      socket.emit("getAllNotifications", allNotifications); // Gửi về client
    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
    }
  });

  socket.on("registerStore", async (storeId) => {
    if (!storeSockets[storeId]) storeSockets[storeId] = [];
    storeSockets[storeId].push(socket.id);
    console.log(`🏪 Store ${storeId} connected with socket ID: ${socket.id}`);

    try {
      const allNotifications = await Notification.find({ storeId }).sort({
        createdAt: -1,
      });
      socket.emit("getAllStoreNotifications", allNotifications || []);
    } catch (err) {
      console.error("Lỗi lấy thông báo store:", err);
    }
  });

  // Gửi thông báo đến tất cả các thiết bị của một user
  socket.on("sendNotification", async ({ userId, title, message, type }) => {
    try {
      const newNotification = new Notification({
        userId,
        title,
        message,
        type,
      });
      await newNotification.save();

      // Gửi thông báo đến tất cả các socket ids của userId
      if (userSockets[userId]) {
        userSockets[userId].forEach((socketId) => {
          io.to(socketId).emit("newNotification", newNotification);
        });
      }
    } catch (error) {
      console.error("Lỗi gửi thông báo:", error);
    }
  });

  socket.on("sendLocation", (locationData) => {
    console.log("Shipper location:", locationData.data);
    io.to(locationData.id).emit("updateLocation", locationData.data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (let userId in userSockets) {
      const socketIndex = userSockets[userId].indexOf(socket.id);
      if (socketIndex !== -1) {
        userSockets[userId].splice(socketIndex, 1);
        console.log(
          `User ${userId} disconnected, removed socket ID: ${socket.id}`
        );
        break;
      }
    }
  });
});

// server.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });

// Handle log
let logClients = [];

// Endpoint SSE
app.get("/logs/stream", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  logClients.push(res);

  console.log("🔌 UI connected to SSE log stream");
  console.log("🔥 Client connected to log stream");

  req.on("close", () => {
    logClients = logClients.filter((c) => c !== res);
    console.log("❌ UI disconnected from SSE log stream");
  });
});

const os = require("os");

const networkInterfaces = os.networkInterfaces();
const address = Object.values(networkInterfaces)
  .flat()
  .find((iface) => iface.family === "IPv4" && !iface.internal)?.address;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at:`);
  console.log(`- Local:    http://localhost:${PORT}`);
  console.log(`- Network:  http://${address}:${PORT}`);
});

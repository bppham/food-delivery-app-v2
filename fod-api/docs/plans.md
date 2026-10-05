# KẾ HOẠCH TRIỂN KHAI VÀ NÂNG CẤP HỆ THỐNG (IMPLEMENTATION PLANS)

> **Dự án:** Food Ordering & Delivery (FOD) Backend  
> **Mục tiêu học tập & nâng cấp:** Redis, Meilisearch, Message Queue (MQ), Background Jobs / Workers, AWS Cloud Ecosystem.

---

## I. MA TRẬN MAPPING CÔNG NGHỆ VÀO NGHIỆP VỤ (TECH STACK MATRIX)

| Công nghệ | Thành phần / File trong source code | Nghiệp vụ cụ thể áp dụng | Vấn đề giải quyết & Giá trị mang lại |
| :--- | :--- | :--- | :--- |
| **Redis (Cache-Aside)** | `services/store.service.js`<br>`services/dish.service.js`<br>`services/systemCategory.service.js` | Cache danh mục hệ thống, thông tin nhà hàng, danh sách món ăn | Giảm tải 80-90% read queries vào MongoDB; API response giảm từ 150ms xuống < 10ms. |
| **Redis (Geospatial)** | `utils/shipper.js`<br>`services/order.service.js` | Lưu tọa độ tài xế online (`GEOADD`), tìm tài xế gần nhà hàng nhất trong bán kính 3km (`GEOSEARCH`) | Tăng tốc độ tìm tài xế gấp 50 lần so với `$geoNear` của MongoDB; tối ưu cho luồng tracking realtime. |
| **Redis (Distributed Lock)** | `services/order.service.js` (`takeOrderService`)<br>`services/cart.service.js` (Voucher count) | Chống Race Condition: 2 tài xế cùng bấm nhận 1 đơn; nhiều khách cùng tranh giật 1 voucher số lượng có hạn | Đảm bảo tính toàn vẹn dữ liệu (Data Integrity) trong môi trường phân tán (Distributed System). |
| **Redis (Pub/Sub & Adapter)** | `server.js`<br>`utils/socketManager.js` | `@socket.io/redis-adapter` để đồng bộ WebSocket đa tiến trình / đa server | Sẵn sàng scale ngang (horizontal scaling) nhiều instance Node.js mà không lo rớt kết nối Socket. |
| **BullMQ (Job Queue)** | `services/payment.service.js`<br>`services/order.service.js` | **Delayed Jobs**: Hủy đơn sau 15p nếu chưa quét VNPay; Hẹn 30s tìm tài xế khác nếu tài xế trước không nhận | Xử lý các tác vụ hẹn giờ động theo từng đơn hàng độc lập, tự động retry khi lỗi. |
| **BullMQ (Background Worker)** | `utils/sendEmail.js`<br>`services/auth.user.service.js` | Đẩy tác vụ gửi Email OTP / Thông báo vào hàng đợi ngầm | API đăng ký/quên mật khẩu phản hồi ngay lập tức (< 30ms) mà không phải chờ SMTP mail server. |
| **BullMQ (Repeatable / Cron)** | Thay thế `crons/shipper_online.cron.js`<br>và `crons/ai.cron.js` | Quét shipper offline mỗi phút, tổng kết doanh thu ngày cho quán, trigger AI model train | Quản lý tập trung trên Redis, không bị mất cron khi restart server, có giao diện **Bull-Board UI**. |
| **Meilisearch** | Thay thế Mongo `$regex` trong `dish.service.js` & `store.service.js` | Tìm kiếm món ăn, quán ăn, lọc theo tag vị/văn hóa, khoảng giá, đánh giá sao | Hỗ trợ tiếng Việt có dấu & không dấu, sửa lỗi gõ sai (Typo tolerance), tốc độ phản hồi < 20ms. |
| **AWS S3 (Presigned URLs)** | `services/upload.service.js` | Client xin URL chữ ký từ backend và upload ảnh thẳng lên S3 | Giải phóng băng thông & RAM cho server Node.js (không phải truyền file binary qua backend). |
| **AWS CloudFront** | Đứng trước S3 Bucket | Phân phối hình ảnh món ăn qua mạng CDN toàn cầu | Tải ảnh cực nhanh, tiết kiệm chi phí băng thông S3, giấu link bucket gốc (Private S3). |
| **AWS SES & DevOps** | Thay thế Nodemailer Gmail;<br>`Dockerfile` + Docker Compose | Gửi email doanh nghiệp; Đóng gói container và deploy lên EC2 / ECS | Quy chuẩn hóa môi trường Production, dễ dàng bảo trì và CI/CD. |

---

## II. LỘ TRÌNH TRIỂN KHAI TỪNG BƯỚC (STEP-BY-STEP ROADMAP)

```
┌─────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 1: REDIS CORE (Caching, Geospatial, Locks)       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 2: BACKGROUND JOBS & QUEUES (BullMQ)             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 3: SEARCH ENGINE MEILISEARCH                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 4: MESSAGE BROKER & EVENT-DRIVEN ORDER FLOW       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 5: AWS CLOUD INTEGRATION & DEPLOYMENT            │
└─────────────────────────────────────────────────────────────┘
```

---

### GIAI ĐOẠN 1: XÂY DỰNG TẦNG REDIS NỀN TẢNG (CORE REDIS)

#### Bước 1.1: Khởi động môi trường & Kiểm tra Redis Client
- **Công cụ:** `docker-compose.yml` (đã tạo) chạy `redis:7-alpine` và `redisinsight`.
- **Hành động:**
  1. Chạy `docker compose up -d`.
  2. Truy cập Web GUI RedisInsight tại: `http://localhost:5540` -> Add connection đến `redis:6379`.
  3. Khởi động backend Node.js, kiểm tra log kết nối thành công từ `config/redis.js`.

#### Bước 1.2: Xây dựng Generic Cache Service (Cache-Aside Pattern)
- **Tạo mới:** `services/cache.service.js`
- **Nguyên lý Cache-Aside:**
  1. Kiểm tra key trong Redis (`GET`).
  2. Nếu có (Cache Hit) -> parse JSON trả về ngay.
  3. Nếu không có (Cache Miss) -> gọi hàm truy vấn MongoDB -> lưu vào Redis (`SET` kèm `EX` TTL) -> trả về kết quả.
- **Tiêu chuẩn đặt Key (Key Naming Convention):**
  - Danh mục hệ thống: `fod:categories:all` (TTL: 24h)
  - Thông tin nhà hàng: `fod:stores:{storeId}` (TTL: 1h)
  - Danh sách món ăn của quán: `fod:dishes:store:{storeId}` (TTL: 30m)
- **Cơ chế Cache Invalidation (Xóa cache khi dữ liệu đổi):**
  - Khi Store cập nhật món ăn -> Xóa key `fod:dishes:store:{storeId}`.
  - Khi Admin cập nhật danh mục -> Xóa key `fod:categories:all`.

#### Bước 1.3: Redis Geospatial - Tối ưu hóa tìm tài xế gần nhất
- **File tác động:** `utils/shipper.js`, `routes/shipper.route.js`, `services/order.service.js`
- **Cách thức thực hiện:**
  1. Khi tài xế online và gửi tọa độ realtime qua WebSocket (`sendLocation`):
     - Gọi lệnh: `GEOADD fod:shippers:locations <longitude> <latitude> <shipperId>`.
     - Set TTL hoặc heartbeat cho tài xế: `SET fod:shippers:online:{shipperId} 1 EX 60`.
  2. Khi nhà hàng nấu xong món (`finishOrderService`):
     - Gọi lệnh: `GEOSEARCH fod:shippers:locations FROMLONLAT <storeLon> <storeLat> BYRADIUS 3 km ASC WITHDIST WITHCOORD`.
     - Lọc nhanh các tài xế khả dụng gần nhất mà không cần aggregate MongoDB.

#### Bước 1.4: Distributed Lock - Chống Race Condition
- **Thư viện đề xuất:** `ioredis` / `redlock` hoặc triển khai bằng lệnh nguyên tử:
  ```bash
  SET fod:locks:order:{orderId} {uniqueWorkerToken} NX PX 10000
  ```
- **Nghiệp vụ áp dụng:**
  1. **Nhận đơn (`takeOrderService` trong `order.service.js`):** Khi 2 shipper cùng nhấn "Nhận đơn" cùng mili-giây, chỉ shipper nào tạo được Lock trước mới được cập nhật đơn hàng thành `delivering`. Shipper thứ hai sẽ nhận phản hồi "Đơn hàng đã có người khác nhận".
  2. **Áp dụng Voucher (`cart.service.js`):** Khóa tạm thời key của Voucher để kiểm tra `usedCount < maxLimit` rồi tăng `INCR` trước khi nhả lock, tránh tình trạng voucher bị dùng vượt số lượng phát hành.

---

### GIAI ĐOẠN 2: QUẢN LÝ TASK & QUEUE VỚI BULLMQ (BACKGROUND & DELAYED JOBS)

#### Bước 2.1: Cài đặt BullMQ và tích hợp Dashboard Bull-Board
- **Cài đặt:** `npm install bullmq @bull-board/express @bull-board/api`
- **Tạo thư mục:** `queues/`
  - `queues/queue.manager.js`: Quản lý các instance Queue và Worker.
  - `queues/email.queue.js`: Queue gửi email.
  - `queues/order.queue.js`: Queue xử lý đơn hàng & timeout.
- **Tích hợp Bull-Board:** Gắn route `/admin/queues` để quản trị viên có thể theo dõi trực quan số lượng job Active, Completed, Failed, Delayed và nút Retry thủ công.

#### Bước 2.2: Email Background Queue (Gửi OTP & Hóa đơn không block API)
- **File tác động:** `utils/sendEmail.js`, `services/auth.user.service.js`
- **Luồng xử lý:**
  1. Controller nhận yêu cầu quên mật khẩu / đăng ký -> Đẩy job vào queue:
     ```javascript
     await emailQueue.add("send-otp", { to: email, otp, subject: "Mã OTP" }, { attempts: 3, backoff: 5000 });
     ```
  2. API trả kết quả ngay lập tức cho người dùng (`{ success: true, message: "OTP đã được gửi" }`).
  3. Worker chạy ngầm bốc job ra gửi qua Nodemailer/SES. Nếu server mail lỗi, tự động retry sau 5 giây.

#### Bước 2.3: Delayed Job - Timeout thanh toán VNPay (15 Phút)
- **File tác động:** `services/payment.service.js`, `services/cart.service.js`
- **Vấn đề:** Khách hàng tạo đơn VNPay nhưng không quét mã QR, khiến voucher bị giữ và đơn hàng treo trạng thái `pending`.
- **Giải pháp:**
  1. Khi tạo giao dịch VNPay, tạo một Delayed Job với delay 15 phút:
     ```javascript
     await orderQueue.add("expire-order", { orderId: newOrder._id }, { delay: 15 * 60 * 1000, jobId: `order-expire-${newOrder._id}` });
     ```
  2. Nếu sau 15 phút khách chưa thanh toán: Worker kiểm tra, tự động chuyển đơn sang `cancelled` và hoàn trả voucher lại cho khách.
  3. Nếu khách thanh toán thành công trước 15 phút: Hủy job này bằng `job.remove()`.

#### Bước 2.4: Delayed Job - Timeout tìm tài xế (30 Giây)
- **File tác động:** `services/order.service.js`
- **Nghiệp vụ:** Bắn thông báo cho Shipper A gần nhất. Tạo delayed job sau 30 giây: nếu Shipper A không nhận đơn, worker sẽ tự động gán và bắn thông báo cho Shipper B tiếp theo.

#### Bước 2.5: Chuyển đổi Cron Jobs truyền thống sang BullMQ Repeatable Jobs
- **File tác động:** Thay thế `crons/shipper_online.cron.js` và `crons/ai.cron.js`
- **Lợi ích:** Các cron job có thể theo dõi được lịch sử chạy, trạng thái fail/success, tự động kích hoạt lại khi server restart.

---

### GIAI ĐOẠN 3: TÌM KIẾM THÔNG MINH VỚI MEILISEARCH

#### Bước 3.1: Dựng Meilisearch bằng Docker & Cài đặt SDK
- Mở comment container `meilisearch` trong `docker-compose.yml`.
- Cài đặt SDK: `npm install meilisearch`.
- Tạo file kết nối: `config/meilisearch.js`.

#### Bước 3.2: Thiết kế Schema & Cấu hình Index
Tạo 2 Index chính:
1. **Index `dishes`**:
   - Fields: `id`, `name`, `price`, `description`, `storeId`, `storeName`, `categoryName`, `tags`, `image`, `rating`.
   - `searchableAttributes`: `["name", "description", "categoryName", "tags"]`.
   - `filterableAttributes`: `["storeId", "price", "categoryName", "tags", "stockStatus"]`.
   - `sortableAttributes`: `["price", "rating", "createdAt"]`.
2. **Index `stores`**:
   - Fields: `id`, `name`, `address_full`, `systemCategoryId`, `avgRating`, `status`.
   - Cấu hình chuẩn hóa tiếng Việt: Tự động hiểu "banh mi" = "bánh mì", "tra sua" = "trà sữa".

#### Bước 3.3: Đồng bộ dữ liệu (Data Syncing Strategy)
- Viết script seed dữ liệu ban đầu từ MongoDB sang Meilisearch (`scripts/sync_meilisearch.js`).
- Sử dụng Hook hoặc Queue: Mỗi khi Store thêm/sửa/xóa món ăn, đẩy một job ngầm cập nhật tài liệu tương ứng trên Meilisearch.

#### Bước 3.4: Viết API Search chuyên nghiệp
- Thay thế toàn bộ code MongoDB `$regex` cũ trong:
  - `getDishesByStoreIdService` ([services/dish.service.js](file:///d:/Personal/Code/FOD/graduation_project_backend/services/dish.service.js))
  - `getAllStoreService` ([services/store.service.js](file:///d:/Personal/Code/FOD/graduation_project_backend/services/store.service.js))
- Hỗ trợ Typo tolerance (gõ "phowr" vẫn ra "phở"), phân trang tốc độ cao và lọc facet filters.

---

### GIAI ĐOẠN 4: KIẾN TRÚC HƯỚNG SỰ KIỆN (EVENT-DRIVEN & ADVANCED MQ)

#### Bước 4.1: Tách biệt Worker Process và API Web Server
- Hiện tại: Tất cả cron, socket, API chạy chung trong `server.js`.
- Cải tiến:
  - `server.js`: Chuyên trách nhận HTTP Request và WebSocket.
  - `worker.js`: Tiến trình chạy độc lập chỉ để xử lý các Job trong BullMQ (Email, Order Timeout, Data Sync).
  - Lợi ích: Dù worker xử lý nặng thì API của người dùng vẫn mượt mà, không bị nghẽn Event Loop.

#### Bước 4.2: Triển khai Event Bus cho vòng đời Đơn hàng
- Khi đơn hàng chuyển trạng thái (`PENDING` -> `CONFIRMED` -> `DELIVERING` -> `COMPLETED`), phát ra các event:
  - `order.created` -> Kích hoạt queue gửi hóa đơn + queue hẹn giờ thanh toán.
  - `order.finished_cooking` -> Kích hoạt queue ghép cặp tài xế.
  - `order.delivered` -> Kích hoạt queue ghi nhận tương tác cho AI Recommendation.

---

### GIAI ĐOẠN 5: TÍCH HỢP HỆ SINH THÁI AWS & CLOUD DEPLOYMENT

#### Bước 5.1: Chuyển đổi sang S3 Presigned URLs
- **File tác động:** [services/upload.service.js](file:///d:/Personal/Code/FOD/graduation_project_backend/services/upload.service.js)
- **Hiện tại:** Frontend gửi file ảnh -> Server Node.js nhận buffer -> Server tải lên S3. (Tốn RAM và CPU của server).
- **Cải tiến:**
  1. Frontend gọi API: `GET /api/v1/upload/presigned-url?fileType=image/jpeg&folder=dishes`.
  2. Backend dùng `@aws-sdk/s3-request-presigner` tạo URL có chữ ký bảo mật và hạn dùng 5 phút.
  3. Frontend dùng URL đó upload file trực tiếp từ trình duyệt lên AWS S3.
  4. Backend chỉ nhận URL ảnh cuối cùng để lưu vào Database.

#### Bước 5.2: Tăng tốc hiển thị với AWS CloudFront CDN
- Tạo phân phối CloudFront trỏ vào S3 Bucket.
- Cấu hình cache ảnh trên các Edge Location gần người dùng (Việt Nam/Singapore).
- Cấu hình OAC (Origin Access Control) để S3 Bucket hoàn toàn Private (chỉ truy cập được thông qua CloudFront).

#### Bước 5.3: Tích hợp AWS SES (Simple Email Service)
- Thay thế SMTP Gmail cá nhân bằng AWS SES để đảm bảo email không bị vào hộp thư rác (Spam).
- Tích hợp qua `@aws-sdk/client-ses`.

#### Bước 5.4: Container hóa và Triển khai lên AWS EC2 / ECS
1. Viết `Dockerfile` tối ưu hóa đa tầng (multi-stage build) để giảm dung lượng image Node.js.
2. Viết `docker-compose.prod.yml` gồm: Node.js App, MongoDB (hoặc kết nối MongoDB Atlas), Redis, Meilisearch, Nginx Reverse Proxy.
3. Tạo máy ảo **AWS EC2 (Ubuntu)**:
   - Cài đặt Docker & Docker Compose.
   - Cấu hình Nginx reverse proxy và chứng chỉ SSL miễn phí từ Let's Encrypt (Certbot).
   - Thiết lập Firewall (Security Groups): Chỉ mở port 80, 443 ra ngoài Internet; các port 27017, 6379, 7700 được bảo vệ an toàn trong mạng nội bộ Docker.

---

## II. DANH SÁCH TỔNG HỢP CÁC USE-CASE CẦN ĐƯA VÀO REDIS (REDIS USE-CASES INVENTORY)

Dưới đây là danh mục toàn bộ các bài toán trong dự án FOD sẽ được giải quyết bằng Redis, phân chia theo từng nhóm nghiệp vụ cụ thể để triển khai dần dần:

### 1. Nhóm Cache-Aside: Dữ liệu tĩnh & Đọc nhiều (Read-Heavy)
* **Case 1.1: Chi tiết Quán ăn theo ID**
  * **Key:** `fod:stores:{storeId}` | **TTL:** 15 phút (`REDIS_TTL.MEDIUM`)
  * **File:** [services/store.service.js](file:///d:/Personal/Code/FOD/graduation_project_backend/services/store.service.js) (`getStoreInformationService`)
  * **Trạng thái:** ✅ *Đã hoàn thành*
* **Case 1.2: Menu món ăn của Quán**
  * **Key:** `fod:dishes:store:{storeId}` | **TTL:** 15 phút (`REDIS_TTL.MEDIUM`)
  * **File:** [services/store.service.js](file:///d:/Personal/Code/FOD/graduation_project_backend/services/store.service.js) (`getAllDishInStoreService`)
  * **Trạng thái:** ⏳ *Chờ triển khai*
* **Case 1.3: Chi tiết Món ăn đơn lẻ**
  * **Key:** `fod:dishes:{dishId}` | **TTL:** 30 phút
  * **File:** [services/dish.service.js](file:///d:/Personal/Code/FOD/graduation_project_backend/services/dish.service.js) (`getDishByIdService`)
  * **Trạng thái:** ⏳ *Chờ triển khai*
* **Case 1.4: Danh mục hệ thống (Trang chủ)**
  * **Key:** `fod:categories:all` | **TTL:** 24 giờ (`REDIS_TTL.LONG`)
  * **File:** [services/systemCategory.service.js](file:///d:/Personal/Code/FOD/graduation_project_backend/services/systemCategory.service.js) (`getAllSystemCategoryService`)
  * **Trạng thái:** ⏳ *Chờ triển khai*
* **Case 1.5: Danh sách Tags văn hóa, vị, cách nấu**
  * **Key:** `fod:tags:all` | **TTL:** 24 giờ (`REDIS_TTL.LONG`)
  * **File:** `services/tags.service.js`
  * **Trạng thái:** ⏳ *Chờ triển khai*

---

### 2. Nhóm Tự Động Xóa Cache (Cache Invalidation)
* **Case 2.1: Hook Store Model**
  * Tự động xóa `fod:stores:{id}` và `fod:stores:list:*` khi có bất kỳ thay đổi nào qua `store.save()`.
  * **File:** [models/stores.model.js](file:///d:/Personal/Code/FOD/graduation_project_backend/models/stores.model.js) (`StoreSchema.post('save')`)
  * **Trạng thái:** ✅ *Đã hoàn thành*
* **Case 2.2: Hook Dish Model**
  * Tự động xóa `fod:dishes:store:{storeId}` khi thêm, sửa giá hoặc xóa món ăn.
  * **File:** [models/dishes.model.js](file:///d:/Personal/Code/FOD/graduation_project_backend/models/dishes.model.js)
  * **Trạng thái:** ⏳ *Chờ triển khai*
* **Case 2.3: Hook Category Model**
  * Tự động xóa `fod:categories:all` khi Admin đổi danh mục hệ thống.
  * **File:** `models/system_categories.model.js`
  * **Trạng thái:** ⏳ *Chờ triển khai*

---

### 3. Nhóm Xác Thực, Bảo Mật & Chống Spam (Auth & Security)
* **Case 3.1: Lưu mã OTP Quên Mật Khẩu tự hủy**
  * **Key:** `fod:otp:forgot_password:{email}` | **TTL:** 120 giây (2 phút)
  * **Giá trị:** Mã OTP 6 số. Không cần lưu rác vào MongoDB, hết 2 phút tự biến mất.
  * **File:** [services/auth.staff.service.js](file:///d:/Personal/Code/FOD/graduation_project_backend/services/auth.staff.service.js) & [services/auth.user.service.js](file:///d:/Personal/Code/FOD/graduation_project_backend/services/auth.user.service.js)
  * **Trạng thái:** 🎯 *Đang thực hiện tiếp theo*
* **Case 3.2: Rate Limiting chống Spam gửi OTP**
  * **Key:** `fod:ratelimit:otp:{email}` | **TTL:** 60 giây
  * **Nghiệp vụ:** Bắt buộc chờ 60s mới được bấm gửi lại OTP, chống spam làm sập server email.
  * **File:** [services/auth.staff.service.js](file:///d:/Personal/Code/FOD/graduation_project_backend/services/auth.staff.service.js)
  * **Trạng thái:** 🎯 *Đang thực hiện tiếp theo*
* **Case 3.3: Blacklist Token khi Đăng Xuất (Revoke JWT)**
  * **Key:** `fod:token:blacklist:{token}` | **TTL:** Bằng thời gian hết hạn còn lại của token
  * **Nghiệp vụ:** Khi user bấm Logout, đưa token vào Blacklist để kẻ xấu không dùng lại được.
  * **File:** `services/auth.service.js` & `middlewares/authMiddleware.js`
  * **Trạng thái:** ⏳ *Chờ triển khai*
* **Case 3.4: Rate Limiting chống Brute-Force Password**
  * **Key:** `fod:ratelimit:login:{ip}` | **TTL:** 15 phút
  * **Nghiệp vụ:** Nhập sai mật khẩu quá 5 lần thì khóa tạm thời IP trong 15 phút.
  * **File:** `middlewares/rateLimitMiddleware.js`
  * **Trạng thái:** ⏳ *Chờ triển khai*

---

### 4. Nhóm Realtime Tọa độ & Trạng thái Tài xế (Geospatial & Heartbeat)
* **Case 4.1: Lưu tọa độ GPS Tài xế Realtime (Write-Heavy)**
  * **Lệnh:** `GEOADD fod:shippers:locations <longitude> <latitude> <shipperId>`
  * **Nghiệp vụ:** Shipper di chuyển gửi tọa độ mỗi 5s, lưu siêu tốc vào RAM Redis (0.1ms).
  * **File:** [server.js](file:///d:/Personal/Code/FOD/graduation_project_backend/server.js) (Socket `sendLocation`), `utils/redis/geo.service.js`
  * **Trạng thái:** ⏳ *Chờ triển khai*
* **Case 4.2: Tìm Tài xế gần quán ăn nhất (Read-Heavy)**
  * **Lệnh:** `GEOSEARCH fod:shippers:locations FROMLONLAT <storeLon> <storeLat> BYRADIUS 3 km ASC`
  * **Nghiệp vụ:** Quán nấu xong, tìm ngay tài xế trong bán kính 3km trong 2ms (thay thế MongoDB query).
  * **File:** [services/order.service.js](file:///d:/Personal/Code/FOD/graduation_project_backend/services/order.service.js)
  * **Trạng thái:** ⏳ *Chờ triển khai*
* **Case 4.3: Shipper Heartbeat / Trạng thái Online tự hủy**
  * **Key:** `fod:shippers:online:{shipperId}` | **TTL:** 60 giây
  * **Nghiệp vụ:** Shipper mất mạng quá 60s thì key tự hủy, hệ thống biết ngay shipper đã offline mà không cần cronjob quét Mongo.
  * **File:** Thay thế `crons/shipper_online.cron.js`
  * **Trạng thái:** ⏳ *Chờ triển khai*

---

### 5. Nhóm Khóa Phân Tán Chống Tranh Chấp (Distributed Locks)
* **Case 5.1: Khóa nhận đơn hàng (Tránh Race Condition)**
  * **Key:** `fod:locks:order:{orderId}` | **TTL:** 10 giây
  * **Nghiệp vụ:** Đảm bảo khi 2-3 shipper cùng bấm "Nhận đơn", chỉ duy nhất 1 người giành được đơn.
  * **File:** [services/order.service.js](file:///d:/Personal/Code/FOD/graduation_project_backend/services/order.service.js) (`takeOrderService`)
  * **Trạng thái:** ⏳ *Chờ triển khai*
* **Case 5.2: Khóa giật Voucher có số lượng giới hạn**
  * **Key:** `fod:locks:voucher:{voucherId}` | **TTL:** 5 giây
  * **Nghiệp vụ:** Đảm bảo khi hàng trăm khách cùng áp mã khuyến mãi cuối cùng thì voucher không bị dùng vượt quá giới hạn phát hành.
  * **File:** [services/cart.service.js](file:///d:/Personal/Code/FOD/graduation_project_backend/services/cart.service.js)
  * **Trạng thái:** ⏳ *Chờ triển khai*

---

## III. BẢNG THEO DÕI TIẾN ĐỘ THỰC HIỆN (CHECKLIST)

### 📌 Giai đoạn 1: Redis Foundation
- [x] Khởi chạy Docker Redis 7 + RedisInsight thành công
- [x] Tạo `constants/redisKeys.constant.js` quy chuẩn Key & TTL
- [x] Xây dựng `utils/redis/cache.service.js` chuẩn Cache-Aside
- [x] Áp dụng Cache-Aside cho Chi tiết Store `getStoreInformationService`
- [x] Tự động xóa Cache bằng Mongoose Post-Save Hook trong `models/stores.model.js`
- [ ] Triển khai Lưu mã OTP Quên Mật Khẩu tự hủy trên Redis (TTL 120s)
- [ ] Triển khai Rate Limiting 60s chống Spam gửi OTP
- [ ] Áp dụng Cache-Aside cho Menu món ăn của Quán `getAllDishInStoreService`
- [ ] Áp dụng Cache-Aside cho Danh mục hệ thống `getAllSystemCategoryService`
- [ ] Triển khai Redis Geo (`GEOADD` & `GEOSEARCH`) cho vị trí và tìm kiếm Shipper
- [ ] Thay thế cron quét Shipper offline bằng Redis Heartbeat
- [ ] Viết Distributed Lock chống tranh chấp nhận đơn `takeOrderService`
- [ ] Viết Distributed Lock chống giật Voucher trong giỏ hàng

### 📌 Giai đoạn 2: BullMQ Job & Workers
- [ ] Tích hợp BullMQ & Web Dashboard Bull-Board
- [ ] Chuyển luồng gửi Email OTP sang Background Queue (gửi ngầm không block API)
- [ ] Tạo Delayed Job tự động hủy đơn VNPay sau 15 phút nếu chưa thanh toán
- [ ] Tạo Delayed Job chuyển đơn sang shipper khác sau 30 giây
- [ ] Thay thế `node-cron` bằng BullMQ Repeatable Jobs

### 📌 Giai đoạn 3: Meilisearch (Search Engine)
- [ ] Chạy container Meilisearch trong `docker-compose.yml`
- [ ] Tạo Index `dishes` và `stores`, cấu hình Search tiếng Việt & Typo tolerance
- [ ] Đồng bộ dữ liệu món ăn/quán ăn từ MongoDB sang Meilisearch
- [ ] Thay thế API tìm kiếm MongoDB Regex (`/store/all`) sang Meilisearch

### 📌 Giai đoạn 4: Event-Driven & Architecture
- [ ] Tách tiến trình `worker.js` riêng biệt với `server.js`
- [ ] Xây dựng Event Bus cho luồng trạng thái đơn hàng

### 📌 Giai đoạn 5: AWS & DevOps
- [ ] Triển khai S3 Presigned URL
- [ ] Cấu hình CloudFront CDN cho hình ảnh
- [ ] Viết `Dockerfile` chuẩn cho Backend
- [ ] Deploy thử nghiệm lên AWS EC2 với Nginx & SSL

---

## IV. BƯỚC ĐANG LÀM HIỆN TẠI
👉 **Triển khai Nhóm 3 (Auth & Security):** Lưu OTP Quên mật khẩu tự hủy trên Redis & Rate Limit 60s chống spam trong [services/auth.staff.service.js](file:///d:/Personal/Code/FOD/graduation_project_backend/services/auth.staff.service.js).


package com.example.ptitdelivery.network;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.example.ptitdelivery.model.Notification;
import com.example.ptitdelivery.utils.NotificationUtils;
import com.example.ptitdelivery.utils.SharedPreferencesHelper;
import com.example.ptitdelivery.viewmodel.NotificationViewModel;

import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;

import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;


public class SocketManager {
    private static Socket mSocket;
    private static Emitter.Listener messageListener;
    private static Emitter.Listener messageDeletedListener;

    public static void connectSocket(Context context) {
        try {
            SharedPreferences sharedPreferences = context.getSharedPreferences("UserPrefs", Context.MODE_PRIVATE);
            String userId = sharedPreferences.getString("id", null);
            List<Notification> notifications = new ArrayList<>();

            if (userId == null) {
                Log.e("SocketManager", "User ID is not available");
                return;
            }

            mSocket = IO.socket(ApiConfig.BASE_URL);
            mSocket.connect();

            mSocket.on(Socket.EVENT_CONNECT, args -> {
                Log.d("SocketManager", "Kết nối thành công đến server");
                // Khi kết nối thành công, gửi userId lên server
                mSocket.emit("registerUser", userId);
            });

            mSocket.on(Socket.EVENT_CONNECT_ERROR, args -> {
                Log.e("SocketManager", "Lỗi kết nối socket: " + args[0]);
            });

            mSocket.on(Socket.EVENT_DISCONNECT, args -> {
                Log.e("SocketManager", "Socket bị ngắt kết nối");
            });

            // Nhận danh sách thông báo
            mSocket.on("getAllNotifications", args -> {
                try {
                    if (args.length > 0 && args[0] instanceof JSONArray) {
                        JSONArray jsonArray = (JSONArray) args[0];

                        for (int i = 0; i < jsonArray.length(); i++) {
                            JSONObject jsonObject = jsonArray.getJSONObject(i);

                            String id = jsonObject.getString("_id");
                            String uId = jsonObject.getString("userId");
                            String title = jsonObject.getString("title");
                            String message = jsonObject.getString("message");
                            String type = jsonObject.getString("type");
                            String status = jsonObject.getString("status");
                            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault());

                            // Chuyển đổi từ chuỗi JSON sang Date
                            Date createdDate = dateFormat.parse(jsonObject.getString("createdAt"));
                            Date updatedDate = dateFormat.parse(jsonObject.getString("updatedAt"));

                            // Chuyển Date thành Timestamp
                            Timestamp createdAt = new Timestamp(createdDate.getTime());
                            Timestamp updatedAt = new Timestamp(updatedDate.getTime());

                            // Tạo đối tượng Notification
                            Notification notification = new Notification(id, uId, title, message, type, status, createdAt, updatedAt);
                            notifications.add(notification);
                        }

                        Log.d("SocketManager", "Danh sách thông báo: " + notifications.toString());

                        // Cập nhật UI hoặc ViewModel nếu cần
                    } else {
                        Log.e("SocketManager", "Không có dữ liệu hợp lệ từ server!");
                    }
                } catch (Exception e) {
                    Log.e("SocketManager", "Lỗi khi xử lý thông báo: ", e);
                }
            });

            // 🟢 Lắng nghe thông báo mới từ server
            mSocket.on("newNotification", args -> {
                try {
                    if (args.length > 0 && args[0] instanceof JSONObject) {
                        JSONObject jsonObject = (JSONObject) args[0];

                        String id = jsonObject.getString("_id");
                        String uId = jsonObject.getString("userId");
                        String title = jsonObject.getString("title");
                        String message = jsonObject.getString("message");
                        String type = jsonObject.getString("type");
                        String status = jsonObject.getString("status");
                        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault());

                        // Chuyển đổi từ chuỗi JSON sang Date
                        Date createdDate = dateFormat.parse(jsonObject.getString("createdAt"));
                        Date updatedDate = dateFormat.parse(jsonObject.getString("updatedAt"));

                        // Chuyển Date thành Timestamp
                        Timestamp createdAt = new Timestamp(createdDate.getTime());
                        Timestamp updatedAt = new Timestamp(updatedDate.getTime());

                        // Tạo đối tượng Notification
                        Notification newNotification = new Notification(id, uId, title, message, type, status, createdAt, updatedAt);

                        Log.d("SocketManager", "Nhận thông báo mới: " + newNotification.toString());

                        notifications.add(newNotification);
                    }
                } catch (Exception e) {
                    Log.e("SocketManager", "Lỗi khi nhận thông báo mới: ", e);
                }
            });

            mSocket.on("newOrderAvailable", args -> {
                try {
                    if (args.length > 0 && args[0] instanceof JSONObject) {
                        JSONObject json = (JSONObject) args[0];
                        String orderId = json.getString("orderId");
                        String status = json.getString("status");
                        Log.d("SocketManager", "📦 Order " + orderId + " updated: " + status);
                        NotificationUtils.showNotification(context, "Bạn có đơn hàng", "Nhận đơn mới và tiến hành giao ngay thôi nào", orderId);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Gửi thông báo
    public static void sendNotification(String userId, String title, String message, String type) {
        JSONObject notification = new JSONObject();
        try {
            notification.put("userId", userId);
            notification.put("title", title);
            notification.put("message", message);
            notification.put("type", type);

            mSocket.emit("sendNotification", notification);  // Gửi thông báo
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    private static String chatIdPendingJoin = null;
    // Tham gia phòng chat
    public static void joinChat(String chatId) {
        if (mSocket != null && mSocket.connected()) {
            mSocket.emit("joinChat", chatId);
            Log.d("SocketManager", "Đã tham gia phòng chat: " + chatId);
        } else {
            // Socket chưa sẵn sàng, lưu lại để join sau
            chatIdPendingJoin = chatId;
            Log.d("SocketManager", "Socket chưa kết nối. Sẽ join sau: " + chatId);
        }
    }


    // Rời phòng chat
    public static void leaveChat(String chatId) {
        if (mSocket != null && mSocket.connected()) {
            mSocket.emit("leaveChat", chatId);
            Log.d("SocketManager", "Đã rời phòng chat: " + chatId);
        }
    }

    // Gửi tin nhắn
    public static void sendMessage(JSONObject message) {
        if (mSocket != null && mSocket.connected()) {
            mSocket.emit("sendMessage", message);
            Log.d("SocketManager", "Đã gửi tin nhắn: " + message.toString());
        }
    }

    // Lắng nghe tin nhắn đến
    public static void setOnMessageReceivedListener(Emitter.Listener listener) {
        messageListener = listener;
        if (mSocket != null) {
            mSocket.on("messageReceived", listener);
        }
    }

    // Lắng nghe xóa tin nhắn
    public static void setOnMessageDeletedListener(Emitter.Listener listener) {
        messageDeletedListener = listener;
        if (mSocket != null) {
            mSocket.on("messageDeleted", listener);
        }
    }

    // Xoá tin nhắn (emit id)
    public static void deleteMessage(String chatId) {
        if (mSocket != null && mSocket.connected()) {
            mSocket.emit("deleteMessage", chatId);
            Log.d("SocketManager", "Đã gửi yêu cầu xoá tin nhắn cho phòng: " + chatId);
        }
    }

    public static void joinOrder(String orderId) {
        if (mSocket != null && mSocket.connected()) {
            mSocket.emit("joinOrder", orderId);
            Log.d("SocketManager", "Đã tham gia order: " + orderId);
        }
    }

    public static void leaveOrder(String orderId) {
        if (mSocket != null && mSocket.connected()) {
            mSocket.emit("leaveOrder", orderId);
            Log.d("SocketManager", "Đã rời order: " + orderId);
        }
    }

    public static void sendLocation(JSONObject location) {
        if (mSocket != null && mSocket.connected()) {
            mSocket.emit("sendLocation", location);
            Log.d("SocketManager", "Đã gửi tin nhắn: " + location.toString());
        }
    }

    public static void setOnLocationUpdatedListener(Emitter.Listener listener) {
        if (mSocket != null) {
            mSocket.on("updateLocation", listener);
        }
    }

    // Đóng kết nối
    public static void disconnectSocket() {
        if (mSocket != null && mSocket.connected()) {
            mSocket.disconnect();
        }
    }
}

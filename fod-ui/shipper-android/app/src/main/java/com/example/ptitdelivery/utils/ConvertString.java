package com.example.ptitdelivery.utils;

public class ConvertString {
    public static String convertPaymentMethod(String paymentMethod){
        String displayMethod;
        switch (paymentMethod) {
            case "cash":
                displayMethod = "Tiền mặt";
                break;
            case "vnpay":
                displayMethod = "VN Pay";
                break;
            default:
                displayMethod = "Không xác định";
                break;
        }
        return displayMethod;
    }

    public static String convertOrderStatus(String status){
        String displayStatus;
        switch (status) {
            case "finished":
                displayStatus = "Sẵn sàng";
                break;
            case "taken":
                displayStatus = "Đã nhận đơn";
                break;
            case "delivering":
                displayStatus = "Đang giao";
                break;
            case "delivered":
                displayStatus = "Đã giao";
                break;
            case "done":
                displayStatus = "Hoàn thành";
                break;
            case "cancelled":
                displayStatus = "Đã hủy đơn";
                break;
            default:
                displayStatus = "Không xác định";
                break;
        }
        return displayStatus;
    }

    public static String convertGender(String gender){
        String displayMethod;
        switch (gender) {
            case "male":
                displayMethod = "Nam";
                break;
            case "female":
                displayMethod = "Nữ";
                break;
            case "Other":
                displayMethod = "Khác";
                break;
            default:
                displayMethod = "Không xác định";
                break;
        }
        return displayMethod;
    }


}

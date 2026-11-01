package com.example.ptitdelivery.utils;

import android.app.AlertDialog;
import android.content.Context;

import com.example.ptitdelivery.R;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;

public class DialogHelper {
    public static void showErrorDialog(Context context, String message) {
        new MaterialAlertDialogBuilder(context)
                .setTitle("Lỗi")
                .setMessage(message)
                .setIcon(R.drawable.ic_error) // Bạn có thể tùy chỉnh icon
                .setPositiveButton("OK", null)
                .setCancelable(true)
                .show();
    }

    public static void showSuccessDialog(Context context, String message) {
        new MaterialAlertDialogBuilder(context)
                .setTitle("Thành công")
                .setMessage(message)
                .setIcon(R.drawable.ic_success) // Tùy chỉnh nếu muốn
                .setPositiveButton("OK", null)
                .setCancelable(true)
                .show();
    }

    public static void showConfirmDialog(Context context, String message, ConfirmCallback callback) {
        new MaterialAlertDialogBuilder(context)
                .setTitle("Xác nhận")
                .setMessage(message)
                .setIcon(R.drawable.ic_question) // Optional icon
                .setPositiveButton("Có", (dialog, which) -> {
                    if (callback != null) {
                        callback.onConfirmed();
                    }
                })
                .setNegativeButton("Không", null)
                .setCancelable(true)
                .show();
    }

    public interface ConfirmCallback {
        void onConfirmed();
    }
}

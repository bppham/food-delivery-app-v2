package com.example.ptitdelivery.utils;

import android.content.Context;
import android.content.SharedPreferences;

public class TokenManager {
    private static final String PREF_NAME = "shipper_prefs";  // Tên file SharedPreferences
    private static final String KEY_TOKEN = "auth_token"; // Khóa lưu token

    private SharedPreferences sharedPreferences;
    private SharedPreferences.Editor editor;

    public TokenManager(Context context) {
        sharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        editor = sharedPreferences.edit();
    }

    // Lưu token
    public void saveToken(String token) {
        editor.putString(KEY_TOKEN, token);
        editor.apply();
    }

    // Lấy token
    public String getToken() {
        return sharedPreferences.getString(KEY_TOKEN, null);
    }

    // Xóa token khi logout
    public void clearToken() {
        editor.remove(KEY_TOKEN);
        editor.apply();
    }
}

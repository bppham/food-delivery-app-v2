package com.example.ptitdelivery.network.interceptor;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import androidx.annotation.NonNull;

import com.example.ptitdelivery.network.ApiConfig;
import com.example.ptitdelivery.network.retrofit.AuthRetrofitFactory;

import org.json.JSONObject;

import java.io.IOException;

import okhttp3.Interceptor;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class RefreshTokenInterceptor implements Interceptor {

    private final Context context;

    public RefreshTokenInterceptor(Context context) {
        this.context = context;
    }

    @NonNull
    @Override
    public Response intercept(@NonNull Chain chain) throws IOException {
        Request request = chain.request();
        Response response = chain.proceed(request);

        if (response.code() != 401) {
            return response;
        }

        response.close();
        Log.e("TOKEN", "Access token expired → refreshing...");

        SharedPreferences prefs = context.getSharedPreferences("UserPrefs", Context.MODE_PRIVATE);
        String refreshToken = prefs.getString("refreshToken", null);
        if (refreshToken == null) return response; // hoặc logout

        String newAccessToken = refreshTokenDirect(refreshToken);
        if (newAccessToken == null) return response; // refresh thất bại

        // lưu token mới
        prefs.edit().putString("token", "Bearer " + newAccessToken).apply();
        AuthRetrofitFactory.init("Bearer " + newAccessToken);

        // retry request với token mới
        Request newRequest = request.newBuilder()
                .header("Authorization", "Bearer " + newAccessToken)
                .build();

        return chain.proceed(newRequest); // 🔹 trả về response mới
    }

    private String refreshTokenDirect(String refreshToken) {
        try {
            OkHttpClient client = new OkHttpClient();

            MediaType JSON = MediaType.parse("application/json; charset=utf-8");
            String jsonBody = "{ \"refreshToken\": \"" + refreshToken + "\" }";
            RequestBody body = RequestBody.create(jsonBody, JSON);

            Request request = new Request.Builder()
                    .url(ApiConfig.BASE_URL + "api/v1/auth/refresh/shipper")
                    .post(body)
                    .build();

            Response response = client.newCall(request).execute();
            try {
                if (!response.isSuccessful() || response.body() == null) {
                    Log.e("TOKEN", "Refresh token API lỗi");
                    return null;
                }

                String responseBody = response.body().string();
                JSONObject json = new JSONObject(responseBody);
                JSONObject data = json.getJSONObject("data");
                return data.getString("token"); // Access token mới
            } finally {
                response.close(); // 🔹 close luôn
            }

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}

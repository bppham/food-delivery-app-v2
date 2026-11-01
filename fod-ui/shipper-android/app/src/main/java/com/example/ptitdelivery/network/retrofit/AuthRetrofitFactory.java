package com.example.ptitdelivery.network.retrofit;

import com.example.ptitdelivery.MyApp;
import com.example.ptitdelivery.activities.MainActivity;
import com.example.ptitdelivery.network.ApiConfig;
import com.example.ptitdelivery.network.interceptor.AuthInterceptor;
import com.example.ptitdelivery.network.interceptor.RefreshTokenInterceptor;

import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class AuthRetrofitFactory implements RetrofitFactory {
    private static AuthRetrofitFactory instance;
    private final String token;
    private AuthRetrofitFactory(String token) {
        this.token = token;
    }
    public static void init(String token) {
        instance = new AuthRetrofitFactory(token);
    }
    public static AuthRetrofitFactory getInstance() {
        if (instance == null) {
            throw new IllegalStateException("AuthRetrofitFactory chưa được khởi tạo. Gọi init(token) trước.");
        }
        return instance;
    }
    public static boolean isInitialized() {
        return instance != null;
    }
    @Override
    public Retrofit createClient() {
        OkHttpClient client = new OkHttpClient.Builder()
                .connectTimeout(100, TimeUnit.SECONDS)
                .readTimeout(100, TimeUnit.SECONDS)
                .writeTimeout(100, TimeUnit.SECONDS)
                .addInterceptor(new AuthInterceptor(token))
                .addInterceptor(new RefreshTokenInterceptor(MyApp.getContext())) // context app
                .build();
        return new Retrofit.Builder()
                .baseUrl(ApiConfig.BASE_URL + "api/v1/")
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build();
    }
}


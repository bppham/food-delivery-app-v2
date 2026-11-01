package com.example.ptitdelivery.network.retrofit;

import com.example.ptitdelivery.network.ApiConfig;

import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class NoAuthRetrofitFactory implements RetrofitFactory{
    private static final NoAuthRetrofitFactory INSTANCE = new NoAuthRetrofitFactory();
    private NoAuthRetrofitFactory() {} // private constructor
    public static NoAuthRetrofitFactory getInstance() {
        return INSTANCE;
    }
    @Override
    public Retrofit createClient() {
        OkHttpClient client = new OkHttpClient.Builder()
                .connectTimeout(100, TimeUnit.SECONDS)
                .readTimeout(100, TimeUnit.SECONDS)
                .writeTimeout(100, TimeUnit.SECONDS)
                .build();

        return new Retrofit.Builder()
                .baseUrl(ApiConfig.BASE_URL + "api/v1/")
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build();
    }
}

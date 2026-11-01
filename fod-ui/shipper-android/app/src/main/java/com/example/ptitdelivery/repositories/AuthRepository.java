package com.example.ptitdelivery.repositories;

import com.example.ptitdelivery.model.Responses.ApiResponse.ApiResponse;
import com.example.ptitdelivery.model.Requests.CheckOTPRequest;
import com.example.ptitdelivery.model.Requests.ForgetPasswordRequest;
import com.example.ptitdelivery.model.LoginData;
import com.example.ptitdelivery.model.Requests.LoginRequest;
import com.example.ptitdelivery.model.Requests.ResetPasswordRequest;
import com.example.ptitdelivery.model.Requests.ShipperRegisterRequest;
import com.example.ptitdelivery.network.retrofit.NoAuthRetrofitFactory;
import com.example.ptitdelivery.network.retrofit.RetrofitFactory;
import com.example.ptitdelivery.network.service.AuthService;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;

public class AuthRepository {
    private final AuthService authService;
    public AuthRepository() {
        RetrofitFactory factory = NoAuthRetrofitFactory.getInstance();
        Retrofit retrofit = factory.createClient();
        this.authService = retrofit.create(AuthService.class);
    }

    public void login(String email, String password, LoginCallback callback){
        LoginRequest request = new LoginRequest(email, password);
        authService.login(request).enqueue(new Callback<ApiResponse<LoginData>>() {
            @Override
            public void onResponse(Call<ApiResponse<LoginData>> call, Response<ApiResponse<LoginData>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    callback.onSuccess(response.body());
                } else {
                    callback.onFailure("Login failed!");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<LoginData>> call, Throwable t) {
                callback.onFailure(t.getMessage());
            }
        });
    }

    public interface LoginCallback {
        void onSuccess(ApiResponse<LoginData> response);
        void onFailure(String errorMessage);
    }

    public void registerShipper(ShipperRegisterRequest request, Callback<ApiResponse<Void>> callback) {
        authService.register(request).enqueue(callback);
    }

    public void forgetPassword(ForgetPasswordRequest request, Callback<ApiResponse<Void>> callback) {
        authService.forgetPassword(request).enqueue(callback);
    }

    public void checkOTP(CheckOTPRequest request, Callback<ApiResponse<Void>> callback) {
        authService.checkOTP(request).enqueue(callback);
    }

    public void resetPassword(ResetPasswordRequest request, Callback<ApiResponse<Void>> callback) {
        authService.resetPassword(request).enqueue(callback);
    }

}

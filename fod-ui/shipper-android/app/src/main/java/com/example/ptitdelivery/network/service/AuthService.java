package com.example.ptitdelivery.network.service;

import com.example.ptitdelivery.model.RefreshTokenResponse;
import com.example.ptitdelivery.model.Requests.RefreshTokenRequest;
import com.example.ptitdelivery.model.Responses.ApiResponse.ApiResponse;
import com.example.ptitdelivery.model.Requests.CheckOTPRequest;
import com.example.ptitdelivery.model.Requests.ForgetPasswordRequest;
import com.example.ptitdelivery.model.LoginData;
import com.example.ptitdelivery.model.Requests.LoginRequest;
import com.example.ptitdelivery.model.Requests.ResetPasswordRequest;
import com.example.ptitdelivery.model.Requests.ShipperRegisterRequest;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;

public interface AuthService {
    @POST("auth/login/shipper")
    Call<ApiResponse<LoginData>> login(@Body LoginRequest loginRequest);
    @POST("auth/shipper/register")
    Call<ApiResponse<Void>> register(@Body ShipperRegisterRequest registerRequest);
    @POST("auth/shipper/forgot-password")
    Call<ApiResponse<Void>> forgetPassword(@Body ForgetPasswordRequest body);
    @POST("auth/shipper/verify-otp")
    Call<ApiResponse<Void>> checkOTP(@Body CheckOTPRequest body);
    @PUT("auth/shipper/reset-password")
    Call<ApiResponse<Void>> resetPassword(@Body ResetPasswordRequest body);
    @GET("auth/refresh/shipper")
    Call<ApiResponse<RefreshTokenResponse>> refreshToken(@Body RefreshTokenRequest request);
}

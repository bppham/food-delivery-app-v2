package com.example.ptitdelivery.network.service;

import com.example.ptitdelivery.model.Requests.ShipperUpdationRequest;
import com.example.ptitdelivery.model.Requests.UpdateLocationRequest;
import com.example.ptitdelivery.model.Requests.UpdateOnlineStatusRequest;
import com.example.ptitdelivery.model.Responses.ApiResponse.ApiResponse;
import com.example.ptitdelivery.model.Requests.ChangePasswordRequest;
import com.example.ptitdelivery.model.Shipper;

import okhttp3.MultipartBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Multipart;
import retrofit2.http.PATCH;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Part;

public interface ShipperService {
    @GET("auth/shipper/profile")
    Call<ApiResponse<Shipper>> getShipper();
    @PUT("auth/shipper/profile/info")
    Call<ApiResponse<Shipper>> updateShipper(@Body ShipperUpdationRequest request);
    @PUT("auth/shipper/profile/password")
    Call<ApiResponse<Void>> resetPassword(@Body ChangePasswordRequest request);
    @Multipart
    @POST("upload/shipper-avatar")
    Call<ApiResponse<Void>> uploadImage(@Part MultipartBody.Part image);

    @PUT("shipper/update-location")
    Call<ApiResponse<Shipper>> updateLocation (@Body UpdateLocationRequest request);
    @PATCH("shipper/online")
    Call<ApiResponse<Void>> updateOnlineStatus(@Body UpdateOnlineStatusRequest request);

}

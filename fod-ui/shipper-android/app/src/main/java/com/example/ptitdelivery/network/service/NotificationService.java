package com.example.ptitdelivery.network.service;

import com.example.ptitdelivery.model.Notification;
import com.example.ptitdelivery.model.Responses.ApiResponse.ApiResponse;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.PUT;
import retrofit2.http.Path;

public interface NotificationService {
    @GET("/api/v1/notification/get-all-notifications")
    Call<ApiResponse<List<Notification>>> getAllNotifications();
    @PUT("/api/v1/notification/update-notification/{id}")
    Call<ApiResponse<List<Notification>>> updateNotificationStatus(@Path("id") String id);
}

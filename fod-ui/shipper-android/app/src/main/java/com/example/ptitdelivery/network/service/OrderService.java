package com.example.ptitdelivery.network.service;

import com.example.ptitdelivery.model.Responses.ApiResponse.ApiResponse;
import com.example.ptitdelivery.model.Order;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.PATCH;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface OrderService {
    @GET("order/{id}/direction")
    Call<ApiResponse<Order>>getOrderDetail(@Path("id") String orderId);
    @GET("order/{id}/shipper")
    Call<ApiResponse<Order>>getOrder(@Path("id") String orderId);
    @GET("order/finished")
    Call<ApiResponse<List<Order>>> getOrders();
    @PATCH("order/{orderId}/taken")
    Call<ApiResponse<Void>> acceptOrder(@Path("orderId") String orderId);
    @PATCH("order/{orderId}/reject")
    Call<ApiResponse<Void>> rejectOrder(@Path("orderId") String orderId);
    @GET("order/ongoing")
    Call<ApiResponse<Order>> getTakenOrder();
    @PATCH("order/{orderId}/delivering")
    Call<ApiResponse<Order>> deliveringOrder(@Path("orderId") String orderId);
    @PATCH("order/{orderId}/delivered")
    Call<ApiResponse<Order>> deliveredOrder(@Path("orderId") String orderId);
    @PATCH("order/{orderId}/complete")
    Call<ApiResponse<Order>> completeOrder(@Path("orderId") String orderId);
    @PATCH("order/{orderId}/cancel-shipper")
    Call<ApiResponse<Void>> cancelOrder(@Path("orderId") String orderId);
    @GET("order/shipper-history")
    Call<ApiResponse<List<Order>>> getDeliveredOrders(
            @Query("page") int page,
            @Query("limit") int limit
    );
}

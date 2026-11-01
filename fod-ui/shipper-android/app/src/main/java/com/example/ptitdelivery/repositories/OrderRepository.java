package com.example.ptitdelivery.repositories;

import android.util.Log;

import androidx.lifecycle.MutableLiveData;

import com.example.ptitdelivery.model.Responses.ApiResponse.ApiResponse;
import com.example.ptitdelivery.model.Order;
import com.example.ptitdelivery.network.retrofit.AuthRetrofitFactory;
import com.example.ptitdelivery.network.service.OrderService;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;

public class OrderRepository {
    private final OrderService orderService;
    public OrderRepository() {
        Retrofit retrofit = AuthRetrofitFactory.getInstance().createClient();
        this.orderService = retrofit.create(OrderService.class);
    }
    public void getOrders(MutableLiveData<List<Order>> orders,
                          MutableLiveData<Boolean> isLoading,
                          MutableLiveData<String> errorMessage) {
        isLoading.setValue(true);

        orderService.getOrders().enqueue(new Callback<ApiResponse<List<Order>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Order>>> call, Response<ApiResponse<List<Order>>> response) {
                isLoading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    orders.setValue(response.body().getData());
                } else {
                    errorMessage.setValue("Lỗi phản hồi: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Order>>> call, Throwable t) {
                isLoading.setValue(false);
                errorMessage.setValue("Lỗi kết nối: " + t.getMessage());
            }
        });
    }
    public void acceptOrder(String orderId, MutableLiveData<Boolean> isAccepted, MutableLiveData<String> errorMessage) {
        orderService.acceptOrder(orderId).enqueue(new Callback<ApiResponse<Void>>() {
            @Override
            public void onResponse(Call<ApiResponse<Void>> call, Response<ApiResponse<Void>> response) {
                if (response.isSuccessful()) {
                    isAccepted.setValue(true);
                } else {
                    if(response.code() == 409) {
                        errorMessage.setValue("Vui lòng hoàn thành đơn đang giao");
                    } else {
                        errorMessage.setValue("Lỗi phản hồi: " + response.message());
                    }
                    isAccepted.setValue(false);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Void>> call, Throwable t) {
                errorMessage.setValue("Lỗi kết nối: " + t.getMessage());
                isAccepted.setValue(false);
            }
        });
    }

    public void rejectOrder(String orderId, MutableLiveData<Boolean> isAccepted, MutableLiveData<String> errorMessage) {
        orderService.rejectOrder(orderId).enqueue(new Callback<ApiResponse<Void>>() {
            @Override
            public void onResponse(Call<ApiResponse<Void>> call, Response<ApiResponse<Void>> response) {
                if (response.isSuccessful()) {
                    isAccepted.setValue(true);
                } else {
                    if(response.code() == 409) {
                        errorMessage.setValue("Vui lòng hoàn thành đơn đang giao");
                    } else {
                        errorMessage.setValue("Lỗi phản hồi: " + response.message());
                    }
                    isAccepted.setValue(false);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Void>> call, Throwable t) {
                errorMessage.setValue("Lỗi kết nối: " + t.getMessage());
                isAccepted.setValue(false);
            }
        });
    }

    public void deliveringOrder(  String orderId,
                                  MutableLiveData<Order> updatedOrder,
                                  MutableLiveData<String> errorMessage,
                                  MutableLiveData<Boolean> isLoading) {
        isLoading.setValue(true);
        orderService.deliveringOrder(orderId).enqueue(new Callback<ApiResponse<Order>>() {
            @Override
            public void onResponse(Call<ApiResponse<Order>> call, Response<ApiResponse<Order>> response) {
                isLoading.setValue(false);
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {

                    // ⭐⭐ Đây là chỗ bạn thiếu ⭐⭐
                    updatedOrder.setValue(response.body().getData());

                } else {
                    errorMessage.setValue("Lỗi: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Order>> call, Throwable t) {
                isLoading.setValue(false);
                errorMessage.setValue("Lỗi kết nối: " + t.getMessage());
            }
        });
    }

    public void deliveredOrder(String orderId,
                               MutableLiveData<Order> updatedOrder,
                               MutableLiveData<String> errorMessage,
                               MutableLiveData<Boolean> isLoading) {
        orderService.deliveredOrder(orderId).enqueue(new Callback<ApiResponse<Order>>() {
            @Override
            public void onResponse(Call<ApiResponse<Order>> call, Response<ApiResponse<Order>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {

                    // ⭐⭐ Đây là chỗ bạn thiếu ⭐⭐
                    updatedOrder.setValue(response.body().getData());

                } else {
                    errorMessage.setValue("Lỗi: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Order>> call, Throwable t) {
                errorMessage.setValue("Lỗi kết nối: " + t.getMessage());
                isLoading.setValue(false);
            }
        });
    }

    public void completeOrder(String orderId,
                              MutableLiveData<Order> updatedOrder,
                              MutableLiveData<String> errorMessage,
                              MutableLiveData<Boolean> isLoading) {
        orderService.completeOrder(orderId).enqueue(new Callback<ApiResponse<Order>>() {
            @Override
            public void onResponse(Call<ApiResponse<Order>> call, Response<ApiResponse<Order>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {

                    // ⭐⭐ Đây là chỗ bạn thiếu ⭐⭐
                    updatedOrder.setValue(response.body().getData());

                } else {
                    errorMessage.setValue("Lỗi: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Order>> call, Throwable t) {
                errorMessage.setValue("Lỗi kết nối: " + t.getMessage());
                isLoading.setValue(false);
            }
        });
    }
    public void getTakenOrder(MutableLiveData<Order> takenOrder,
                              MutableLiveData<String> errorMessage,
                              MutableLiveData<Boolean> isLoading) {
        isLoading.setValue(true);
        orderService.getTakenOrder().enqueue(new Callback<ApiResponse<Order>>() {
            @Override
            public void onResponse(Call<ApiResponse<Order>> call, Response<ApiResponse<Order>> response) {
                isLoading.setValue(false);
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    takenOrder.setValue(response.body().getData());
                } else {
                    errorMessage.setValue(response.body() != null ? response.body().getMessage() : "Không có đơn hàng nào.");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Order>> call, Throwable t) {
                errorMessage.setValue("Lỗi kết nối: " + t.getMessage());
                isLoading.setValue(false);
            }
        });
    }

    public void getDeliveredOrders(int page, int limit,
                                   MutableLiveData<List<Order>> deliveredOrders,MutableLiveData<Integer> totalPages,
                                   MutableLiveData<Boolean> isLoading,
                                   MutableLiveData<String> errorMessage){
        isLoading.setValue(true);
        Log.d("DeliveredOrders", "Calling API with page: " + page + " and limit: " + limit);


        orderService.getDeliveredOrders(page, limit).enqueue(new Callback<ApiResponse<List<Order>>>() {

            @Override
            public void onResponse(Call<ApiResponse<List<Order>>> call, Response<ApiResponse<List<Order>>> response) {
                isLoading.setValue(false);
                if (response.isSuccessful()) {
                    // Log response body to see the data
                    Log.d("DeliveredOrders", "Response body: " + response.body());

                    // Kiểm tra body có null không
                    if (response.body() != null) {
                        deliveredOrders.setValue(response.body().getData());
                        totalPages.setValue(response.body().getMeta().getTotalPages());
                    } else {
                        errorMessage.setValue("Dữ liệu trống từ API");
                        Log.e("DeliveredOrders", "Response body is null");
                    }
                } else {
                    // Log lỗi và mã trạng thái HTTP
                    errorMessage.setValue("Lỗi phản hồi từ repo-delivered orders: " + response.code());
                    Log.e("DeliveredOrders", "Response failed with code: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Order>>> call, Throwable t) {
                isLoading.setValue(false);
                errorMessage.setValue("Lỗi kết nối: " + t.getMessage());
                Log.e("DeliveredOrders", "Response failed with error: " + t.getMessage(), t);
            }
        });
    }

    // For map
//    public LiveData<Resource<ApiResponse<Order>>> getOrderDetail(String orderId) {
//        MutableLiveData<Resource<ApiResponse<Order>>> result = new MutableLiveData<>();
//        result.setValue(Resource.loading(null));
//
//        orderService.getOrderDetail(orderId).enqueue(new Callback<ApiResponse<Order>>() {
//            @Override
//            public void onResponse(Call<ApiResponse<Order>> call, Response<ApiResponse<Order>> response) {
//                if (response.isSuccessful() && response.body() != null) {
//                    Log.d("OrderRepository", "getOrderDetail: " + response.body());
//                    result.setValue(Resource.success("Lay thong tin thành công!", response.body()));
//                } else {
//                    try {
//                        String errorMessage = response.errorBody().string();
//                        JSONObject jsonObject = new JSONObject(errorMessage);
//                        String message = jsonObject.getString("message");
//                        result.setValue(Resource.error(message, null));
//                    } catch (Exception e) {
//                        result.setValue(Resource.error("Lỗi không xác định!", null));
//                    }
//                }
//            }
//
//            @Override
//            public void onFailure(Call<ApiResponse<Order>> call, Throwable t) {
//                result.setValue(Resource.error("Lỗi kết nối: " + t.getMessage(), null));
//            }
//        });
//
//        return result;
//    }

    public void getOrderDetail(String orderId,
                               MutableLiveData<Order> orderDetail,
                               MutableLiveData<Boolean> isLoading,
                               MutableLiveData<String> errorMessage) {
        isLoading.setValue(true);

        orderService.getOrderDetail(orderId).enqueue(new Callback<ApiResponse<Order>>() {
            @Override
            public void onResponse(Call<ApiResponse<Order>> call, Response<ApiResponse<Order>> response) {
                isLoading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    Log.d("DetailOrder", "Response body: " + response.body());
                    orderDetail.setValue(response.body().getData());
                } else {
                    errorMessage.setValue("Lỗi phản hồi: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Order>> call, Throwable t) {
                isLoading.setValue(false);
                errorMessage.setValue("Lỗi kết nối: " + t.getMessage());
                Log.e("Detail", "Response failed with error: " + t.getMessage(), t);
            }

        });
    }

    public void getNewOrderDetail(String orderId,
                                  MutableLiveData<Order> orderDetail,
                                  MutableLiveData<Boolean> isLoading,
                                  MutableLiveData<String> errorMessage) {
        isLoading.setValue(true);

        orderService.getOrder(orderId).enqueue(new Callback<ApiResponse<Order>>() {
            @Override
            public void onResponse(Call<ApiResponse<Order>> call, Response<ApiResponse<Order>> response) {
                isLoading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    Log.d("DetailOrder", "Response body: " + response.body());
                    orderDetail.setValue(response.body().getData());
                } else {
                    errorMessage.setValue("Lỗi phản hồi: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Order>> call, Throwable t) {
                isLoading.setValue(false);
                errorMessage.setValue("Lỗi kết nối: " + t.getMessage());
                Log.e("Detail", "Response failed with error: " + t.getMessage(), t);
            }

        });
    }

    public void cancelOrder(String orderId,
                            MutableLiveData<Boolean> isCanceled,
                            MutableLiveData<String> errorMessage,
                            MutableLiveData<Boolean> isLoading) {
        isLoading.setValue(true);
        orderService.cancelOrder(orderId).enqueue(new Callback<ApiResponse<Void>>() {
            @Override
            public void onResponse(Call<ApiResponse<Void>> call, Response<ApiResponse<Void>> response) {
                isLoading.setValue(false);
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    isCanceled.setValue(true);  // API cancel thành công
                } else {
                    isCanceled.setValue(false);
                    errorMessage.setValue(response.body() != null ? response.body().getMessage() : "Lỗi: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Void>> call, Throwable t) {
                isLoading.setValue(false);
                isCanceled.setValue(false);
                errorMessage.setValue("Lỗi kết nối: " + t.getMessage());
            }
        });
    }

}

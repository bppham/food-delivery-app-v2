package com.example.ptitdelivery.viewmodel;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.example.ptitdelivery.model.Order;
import com.example.ptitdelivery.model.Responses.ApiResponse.ApiResponse;
import com.example.ptitdelivery.network.retrofit.AuthRetrofitFactory;
import com.example.ptitdelivery.repositories.OrderRepository;
import com.example.ptitdelivery.utils.Resource;

import java.util.List;

public class OrderViewModel extends ViewModel {
    private OrderRepository repository;
    public OrderViewModel() {
        if (!AuthRetrofitFactory.isInitialized()) {
            throw new IllegalStateException("AuthRetrofitFactory chưa được khởi tạo! Phải login trước.");
        }
        this.repository = new OrderRepository();
    }
    private final MutableLiveData<Resource<ApiResponse<List<Order>>>> currentOrderResponse = new MutableLiveData<>();
    private final MutableLiveData<Order> orderDetail = new MutableLiveData<>();
    private final MutableLiveData<String> errorMessage = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isLoading = new MutableLiveData<>();
    public LiveData<Resource<ApiResponse<List<Order>>>> getCurrentOrderResponse() {
        return currentOrderResponse;
    }
    public void getOrder(String orderId) {
        repository.getNewOrderDetail(orderId, orderDetail, isLoading, errorMessage);
    }
    private final MutableLiveData<Resource<ApiResponse<List<Order>>>> historyOrderResponse = new MutableLiveData<>();
    public LiveData<Resource<ApiResponse<List<Order>>>> getHistoryOrderResponse() {
        return historyOrderResponse;
    }
    private final MutableLiveData<Resource<ApiResponse<Order>>> orderDetailResponse = new MutableLiveData<>();
    public LiveData<Resource<ApiResponse<Order>>> getOrderDetailResponse() {
        return orderDetailResponse;
    }
    private final MutableLiveData<Resource<ApiResponse<String>>> cancelOrderResponse = new MutableLiveData<>();
    public LiveData<Resource<ApiResponse<String>>> getCancelOrderResponse() {
        return cancelOrderResponse;
    }
    public LiveData<Order> getOrderDetail() {
        return orderDetail;
    }

}

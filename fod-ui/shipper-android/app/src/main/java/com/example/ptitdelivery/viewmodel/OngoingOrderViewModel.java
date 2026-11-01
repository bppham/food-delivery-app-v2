package com.example.ptitdelivery.viewmodel;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.example.ptitdelivery.model.Order;
import com.example.ptitdelivery.network.retrofit.AuthRetrofitFactory;
import com.example.ptitdelivery.repositories.OrderRepository;

public class OngoingOrderViewModel extends ViewModel {
    private OrderRepository repository;
    public OngoingOrderViewModel() {
        if (!AuthRetrofitFactory.isInitialized()) {
            throw new IllegalStateException("AuthRetrofitFactory chưa được khởi tạo! Phải login trước.");
        }
        this.repository = new OrderRepository();
    }
    private final MutableLiveData<Order> takenOrder = new MutableLiveData<>();
    private final MutableLiveData<String> errorMessage = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isLoading = new MutableLiveData<>();
    private final MutableLiveData<Order> updatedOrder = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isOrderAccepted = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isOrderCanceled = new MutableLiveData<>();
    public void getTakenOrder() {
        repository.getTakenOrder(takenOrder, errorMessage, isLoading);
    }
    public LiveData<Order> getTakenOrderLiveData() {
        return takenOrder;
    }
    public LiveData<Order> getUpdatedOrderLiveData() {
        return updatedOrder;
    }
    public LiveData<String> getErrorMessageLiveData() {
        return errorMessage;
    }
    public LiveData<Boolean> getIsLoadingLiveData() {
        return isLoading;
    }
    public LiveData<Boolean> getIsOrderAccepted() {
        return isOrderAccepted;
    }

    public void deliveringOrder(String orderId) {
        repository.deliveringOrder(orderId, updatedOrder, errorMessage, isLoading);
    }

    public void deliveredOrder(String orderId) {
        repository.deliveredOrder(orderId, updatedOrder, errorMessage, isLoading);
    }

    public void completeOrder(String orderId) {
        repository.completeOrder(orderId, updatedOrder, errorMessage, isLoading);
    }

    public LiveData<Boolean> getIsOrderCanceled() {
        return isOrderCanceled;
    }

    public void cancelOrder(String orderId) {
        repository.cancelOrder(orderId, isOrderCanceled, errorMessage, isLoading);
    }

}

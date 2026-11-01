package com.example.ptitdelivery.viewmodel;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.example.ptitdelivery.model.Order;
import com.example.ptitdelivery.network.retrofit.AuthRetrofitFactory;
import com.example.ptitdelivery.repositories.OrderRepository;

import java.util.List;

public class NewOrdersViewModel extends ViewModel {

    private final OrderRepository repository;
    private final MutableLiveData<List<Order>> orders = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isLoading = new MutableLiveData<>(false);
    private final MutableLiveData<String> errorMessage = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isOrderAccepted = new MutableLiveData<>();

    public NewOrdersViewModel() {
        if (!AuthRetrofitFactory.isInitialized()) {
            throw new IllegalStateException("AuthRetrofitFactory chưa được khởi tạo! Phải login trước.");
        }
        this.repository = new OrderRepository();
    }

    // --- Getter ---
    public LiveData<List<Order>> getOrders() {
        return orders;
    }

    public LiveData<Boolean> getIsLoading() {
        return isLoading;
    }

    public LiveData<String> getErrorMessage() {
        return errorMessage;
    }

    public LiveData<Boolean> getIsOrderAccepted() {
        return isOrderAccepted;
    }

    // --- Fetch Orders ---
    public void fetchOrders() {
        repository.getOrders(orders, isLoading, errorMessage);
    }

    // --- Accept Order ---
    public void acceptOrder(String orderId) {
        repository.acceptOrder(orderId, isOrderAccepted, errorMessage);
    }
    public void rejectOrder(String orderId) {
        repository.rejectOrder(orderId, isOrderAccepted, errorMessage);
    }

}

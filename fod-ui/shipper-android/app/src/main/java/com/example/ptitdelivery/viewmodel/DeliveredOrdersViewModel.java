package com.example.ptitdelivery.viewmodel;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.example.ptitdelivery.model.Order;
import com.example.ptitdelivery.network.retrofit.AuthRetrofitFactory;
import com.example.ptitdelivery.repositories.OrderRepository;

import java.util.List;

public class DeliveredOrdersViewModel extends ViewModel {
    public DeliveredOrdersViewModel() {
        if (!AuthRetrofitFactory.isInitialized()) {
            throw new IllegalStateException("AuthRetrofitFactory chưa được khởi tạo! Phải login trước.");
        }
        this.repository = new OrderRepository();
    }
    private final MutableLiveData<List<Order>> deliveredOrders = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isLoading = new MutableLiveData<>(false);
    private final MutableLiveData<String> errorMessage = new MutableLiveData<>();
    private final MutableLiveData<Integer> totalPages = new MutableLiveData<>();
    private final MutableLiveData<Integer> currentPage = new MutableLiveData<>(1);
    private OrderRepository repository;
    public LiveData<List<Order>> getDeliveredOrders() {
        return deliveredOrders;
    }

    public LiveData<Boolean> getIsLoading() {
        return isLoading;
    }

    public LiveData<String> getErrorMessage() {
        return errorMessage;
    }

    public LiveData<Integer> getTotalPages() {
        return totalPages;
    }

    public LiveData<Integer> getCurrentPage() {
        return currentPage;
    }

    public void fetchDeliveredOrders(int page, int limit) {
        currentPage.setValue(page);
        repository.getDeliveredOrders(
                page,
                limit,
                deliveredOrders,
                totalPages,
                isLoading,
                errorMessage
        );
    }

    public void nextPage(int limit) {
        Integer page = currentPage.getValue();
        Integer total = totalPages.getValue();
        if (page != null && total != null && page < total) {
            fetchDeliveredOrders(page + 1, limit);
        }
    }

    public void previousPage(int limit) {
        Integer page = currentPage.getValue();
        if (page != null && page > 1) {
            fetchDeliveredOrders(page - 1, limit);
        }
    }
}

package com.example.ptitdelivery.viewmodel;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;


import com.example.ptitdelivery.model.Notification;
import com.example.ptitdelivery.model.Responses.ApiResponse.ApiResponse;
import com.example.ptitdelivery.network.retrofit.AuthRetrofitFactory;
import com.example.ptitdelivery.repositories.NotificationRepository;
import com.example.ptitdelivery.utils.Resource;

import java.util.ArrayList;
import java.util.List;

public class NotificationViewModel extends ViewModel {
    private NotificationRepository repository;
    public NotificationViewModel() {
        if (!AuthRetrofitFactory.isInitialized()) {
            throw new IllegalStateException("AuthRetrofitFactory chưa được khởi tạo! Phải login trước.");
        }
        this.repository = new NotificationRepository();
    }
    private final MutableLiveData<Resource<ApiResponse<List<Notification>>>> allNotificationsResponse = new MutableLiveData<>();
    public LiveData<Resource<ApiResponse<List<Notification>>>> getAllNotificationsResponse() {
        return allNotificationsResponse;
    }
    private final MutableLiveData<Resource<ApiResponse<List<Notification>>>> updateNotificationStatusResponse = new MutableLiveData<>();
    public LiveData<Resource<ApiResponse<List<Notification>>>> getUpdateNotificationStatusResponse() {
        return updateNotificationStatusResponse;
    }

    private MutableLiveData<Resource<List<Notification>>> notifications = new MutableLiveData<>();
    public LiveData<Resource<List<Notification>>> getNotificationsResponse() {
        return notifications;
    }
    public void updateNotifications(List<Notification> notificationsList) {
        // Tạo một đối tượng List<Notification> mới (dùng ArrayList để lưu trữ dữ liệu)
        List<Notification> response = new ArrayList<>(notificationsList);

        // Cập nhật LiveData với giá trị thành công
        notifications.postValue(new Resource<>(Resource.Status.SUCCESS, response, null));
    }
}

package com.example.ptitdelivery.repositories;

import com.example.ptitdelivery.network.retrofit.AuthRetrofitFactory;
import com.example.ptitdelivery.network.service.NotificationService;

import retrofit2.Retrofit;

public class NotificationRepository {
    private final NotificationService notificationService;
    public NotificationRepository() {
        Retrofit retrofit = AuthRetrofitFactory.getInstance().createClient();
        this.notificationService = retrofit.create(NotificationService.class);
    }
}

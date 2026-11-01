package com.example.ptitdelivery.viewmodel;

import android.app.Application;
import android.content.Context;
import android.net.Uri;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModel;

import com.example.ptitdelivery.model.Image;
import com.example.ptitdelivery.network.retrofit.AuthRetrofitFactory;
import com.example.ptitdelivery.repositories.OrderRepository;
import com.example.ptitdelivery.repositories.UploadRepository;
import com.example.ptitdelivery.utils.Resource;

import java.util.List;

public class UploadViewModel extends ViewModel {
    private UploadRepository uploadRepository;
    public UploadViewModel() {
        if (!AuthRetrofitFactory.isInitialized()) {
            throw new IllegalStateException("AuthRetrofitFactory chưa được khởi tạo! Phải login trước.");
        }
        this.uploadRepository = new UploadRepository();
    }
    private final MutableLiveData<Resource<String>> uploadAvatarResponse = new MutableLiveData<>();
    public LiveData<Resource<String>> getUploadAvatarResponse() {
        return uploadAvatarResponse;
    }
    private final MutableLiveData<Resource<List<Image>>> uploadImagesResponse = new MutableLiveData<>();
    public LiveData<Resource<List<Image>>> getUploadImagesResponse() {
        return uploadImagesResponse;
    }
    public void uploadAvatar(Uri imageUri, Context context) {
        LiveData<Resource<String>> result = uploadRepository.uploadAvatar(imageUri, context);
        result.observeForever(new Observer<Resource<String>>() {
            @Override
            public void onChanged(Resource<String> resource) {
                uploadAvatarResponse.setValue(resource);
            }
        });
    }
    public void uploadImages(List<Uri> imageUris, Context context) {
        LiveData<Resource<List<Image>>> result = uploadRepository.uploadMultipleImages(imageUris, context);
        result.observeForever(new Observer<Resource<List<Image>>>() {
            @Override
            public void onChanged(Resource<List<Image>> resource) {
                uploadImagesResponse.setValue(resource);
            }
        });
    }
}

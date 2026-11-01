package com.example.ptitdelivery.viewmodel;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.example.ptitdelivery.model.Requests.ShipperUpdationRequest;
import com.example.ptitdelivery.model.Requests.UpdateLocationRequest;
import com.example.ptitdelivery.model.Requests.UpdateOnlineStatusRequest;
import com.example.ptitdelivery.model.Responses.ApiResponse.ApiResponse;
import com.example.ptitdelivery.model.Requests.ChangePasswordRequest;
import com.example.ptitdelivery.model.Shipper;
import com.example.ptitdelivery.network.retrofit.AuthRetrofitFactory;
import com.example.ptitdelivery.repositories.ShipperRepository;

import java.io.File;

public class ProfileViewModel extends ViewModel {
    private ShipperRepository repository;
    public ProfileViewModel() {
        if (!AuthRetrofitFactory.isInitialized()) {
            throw new IllegalStateException("AuthRetrofitFactory chưa được khởi tạo! Phải login trước.");
        }
        this.repository = new ShipperRepository();
    }
    private final MutableLiveData<Shipper> shipper = new MutableLiveData<>();
    private final MutableLiveData<ApiResponse<Void>> responseChangePassword = new MutableLiveData<>();
    private final MutableLiveData<ApiResponse<Void>> responseUpload = new MutableLiveData<>();
    private final MutableLiveData<ApiResponse<Void>> responseUpdateOnlineStatus = new MutableLiveData<>();
    private final MutableLiveData<ApiResponse<Shipper>> responseUpdateLocation = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isUpdateSuccess = new MutableLiveData<>();
    private final MutableLiveData<String> imageUrl = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isLoading = new MutableLiveData<>();
    private final MutableLiveData<String> errorMessage = new MutableLiveData<>();
    public void getShipper(String id) {
        repository.getShipper(id, shipper, isLoading, errorMessage);
    }
    public void updateShipper(ShipperUpdationRequest request) {
        repository.updateShipper(request, shipper, isLoading, errorMessage, isUpdateSuccess);
    }
    public void resetPassword(ChangePasswordRequest request) {
        repository.resetPassword(request, responseChangePassword, isLoading, errorMessage);
    }
    public LiveData<ApiResponse<Void>> getResponseChangePassword() {
        return responseChangePassword;
    }
    public void uploadAvatar(File imageFile) {
        repository.uploadAvatar(imageFile, responseUpload, errorMessage, isLoading);
    }
    public void updateLocation(UpdateLocationRequest request) {
            repository.updateLocation(request, responseUpdateLocation, isLoading, errorMessage);
    }
    public void updateOnlineStatus(UpdateOnlineStatusRequest request) {
        repository.updateOnlineStatus(request,responseUpdateOnlineStatus, isLoading, errorMessage);
    }
    public LiveData<String> getImageUrlLiveData() {
        return imageUrl;
    }
    public LiveData<Shipper> getShipperLiveData() {
        return shipper;
    }
    public LiveData<Boolean> getIsUpdateSuccess() {
        return isUpdateSuccess;
    }
    public LiveData<String> getErrorMessageLiveData() {
        return errorMessage;
    }
    public LiveData<Boolean> getIsLoadingLiveData() {
        return isLoading;
    }

    public LiveData<ApiResponse<Void>> getResponseUploadLiveData() {
        return responseUpload;
    }


    // Handle Heartbeat
    private final Handler handler = new Handler(Looper.getMainLooper());
    private Runnable updateTask;
    public void startHeartbeat(UpdateLocationRequest request) {
        if (updateTask == null) {
            updateTask = new Runnable() {
                @Override
                public void run() {
                    System.out.println("🔥 Heartbeat triggered"); // DEBUG
                    Log.d("LOCATION" ,"Heartbeat triggered");
                    updateLocation(request);
                    handler.postDelayed(this, 30_000);
                }
            };
            handler.post(updateTask);
            Log.d("LOCATION" ,"Heartbeat start");
        }
    }
    public void stopHeartbeat() {
        if (updateTask != null) {
            handler.removeCallbacks(updateTask);
            updateTask = null;
        }
    }

    @Override
    protected void onCleared() {
        super.onCleared();
        stopHeartbeat();
    }
}

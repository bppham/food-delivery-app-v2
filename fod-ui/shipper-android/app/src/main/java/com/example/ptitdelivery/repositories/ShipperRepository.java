package com.example.ptitdelivery.repositories;

import android.util.Log;

import androidx.lifecycle.MutableLiveData;

import com.example.ptitdelivery.model.Requests.ShipperUpdationRequest;
import com.example.ptitdelivery.model.Requests.UpdateLocationRequest;
import com.example.ptitdelivery.model.Requests.UpdateOnlineStatusRequest;
import com.example.ptitdelivery.model.Responses.ApiResponse.ApiResponse;
import com.example.ptitdelivery.model.Requests.ChangePasswordRequest;
import com.example.ptitdelivery.model.Shipper;
import com.example.ptitdelivery.network.retrofit.AuthRetrofitFactory;
import com.example.ptitdelivery.network.service.ShipperService;

import java.io.File;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;

public class ShipperRepository {
    private final ShipperService shipperService;
    public ShipperRepository() {
        Retrofit retrofit = AuthRetrofitFactory.getInstance().createClient();
        this.shipperService = retrofit.create(ShipperService.class);
    }
    public void getShipper(String id, MutableLiveData<Shipper> shipper, MutableLiveData<Boolean> isLoading, MutableLiveData<String> errorMessage) {
        isLoading.setValue(true);
        shipperService.getShipper().enqueue(new Callback<ApiResponse<Shipper>>() {

            @Override
            public void onResponse(Call<ApiResponse<Shipper>> call, Response<ApiResponse<Shipper>> response) {
                isLoading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    shipper.setValue(response.body().getData());
                } else {
                    errorMessage.setValue("Không lấy được thông tin shipper");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Shipper>> call, Throwable t) {
                isLoading.setValue(false);
                errorMessage.setValue("Lỗi kết nối: " + t.getMessage());
            }
        });
    }

    public void updateShipper(
            ShipperUpdationRequest request,
            MutableLiveData<Shipper> shipper,
            MutableLiveData<Boolean> isLoading,
            MutableLiveData<String> errorMessage,
            MutableLiveData<Boolean> isUpdateSuccess) {

        isLoading.setValue(true);
        shipperService.updateShipper(request).enqueue(new Callback<ApiResponse<Shipper>>() {
            @Override
            public void onResponse(Call<ApiResponse<Shipper>> call, Response<ApiResponse<Shipper>>response) {
                isLoading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    shipper.setValue(response.body().getData());
                    isUpdateSuccess.setValue(true);
                } else {
                    errorMessage.setValue("Không thể cập nhật thông tin shipper");
                    isUpdateSuccess.setValue(false);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Shipper>>call, Throwable t) {
                isLoading.setValue(false);
                errorMessage.setValue("Lỗi kết nối: " + t.getMessage());
                isUpdateSuccess.setValue(false);
            }
        });
    }
    public void resetPassword(ChangePasswordRequest request,
                              MutableLiveData<ApiResponse<Void>> responseLiveData,
                              MutableLiveData<Boolean> isLoading,
                              MutableLiveData<String> errorMessage) {
        isLoading.setValue(true);
        shipperService.resetPassword(request).enqueue(new Callback<ApiResponse<Void>>() {
            @Override
            public void onResponse(Call<ApiResponse<Void>> call, Response<ApiResponse<Void>> response) {
                isLoading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    responseLiveData.setValue(response.body());
                } else {
                    errorMessage.setValue("Không thể đổi mật khẩu");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Void>> call, Throwable t) {
                isLoading.setValue(false);
                errorMessage.setValue("Lỗi kết nối: " + t.getMessage());
            }
        });
    }

    public void uploadAvatar(File imageFile,
                             MutableLiveData<ApiResponse<Void>> responseLiveData,
                                  MutableLiveData<String> errorMessage,
                                  MutableLiveData<Boolean> isLoading) {
        isLoading.setValue(true);

        RequestBody requestFile = RequestBody.create(MediaType.parse("image/*"), imageFile);
        MultipartBody.Part body = MultipartBody.Part.createFormData("file", imageFile.getName(), requestFile);

        shipperService.uploadImage(body).enqueue(new Callback<ApiResponse<Void>>() {
            @Override
            public void onResponse(Call<ApiResponse<Void>> call, Response<ApiResponse<Void>> response) {
                isLoading.setValue(false);
                if (response.isSuccessful()) {
                    responseLiveData.setValue(response.body());
                } else {
                    errorMessage.setValue("Upload ảnh thất bại");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Void>> call, Throwable t) {
                isLoading.setValue(false);
                errorMessage.setValue("Lỗi kết nối khi upload: " + t.getMessage());
            }
        });
    }

    public void updateLocation(UpdateLocationRequest request,
                              MutableLiveData<ApiResponse<Shipper>> responseLiveData,
                              MutableLiveData<Boolean> isLoading,
                              MutableLiveData<String> errorMessage) {
        isLoading.setValue(true);
        Log.d("LOCATION" ,request.getLat() + ", lon=" + request.getLon());
        shipperService.updateLocation(request).enqueue(new Callback<ApiResponse<Shipper>>() {
            @Override
            public void onResponse(Call<ApiResponse<Shipper>> call, Response<ApiResponse<Shipper>> response) {
                isLoading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    responseLiveData.setValue(response.body());
                } else {
                    errorMessage.setValue("Không thể cập nhật vị tr");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Shipper>> call, Throwable t) {
                isLoading.setValue(false);
                errorMessage.setValue("Lỗi kết nối: " + t.getMessage());
            }
        });
    }

    public void updateOnlineStatus(UpdateOnlineStatusRequest request,
                                   MutableLiveData<ApiResponse<Void>> responseLiveData,
                                   MutableLiveData<Boolean> isLoading,
                                   MutableLiveData<String> errorMessage) {
        isLoading.setValue(true);
        shipperService.updateOnlineStatus(request).enqueue(new Callback<ApiResponse<Void>>() {
            @Override
            public void onResponse(Call<ApiResponse<Void>> call, Response<ApiResponse<Void>> response) {
                isLoading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    responseLiveData.setValue(response.body());
                } else {
                    errorMessage.setValue("Không thể đổi mật khẩu");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Void>> call, Throwable t) {
                isLoading.setValue(false);
                errorMessage.setValue("Lỗi kết nối: " + t.getMessage());
            }
        });
    }
}

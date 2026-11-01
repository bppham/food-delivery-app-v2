package com.example.ptitdelivery.viewmodel;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.example.ptitdelivery.model.Responses.ApiResponse.ApiResponse;
import com.example.ptitdelivery.model.Requests.ResetPasswordRequest;
import com.example.ptitdelivery.repositories.AuthRepository;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ResetPasswordViewModel extends ViewModel {
    private AuthRepository repository;
    public ResetPasswordViewModel() {
        this.repository = new AuthRepository();
    }
    private final MutableLiveData<ApiResponse<Void>> resetPasswordResponse = new MutableLiveData<>();
    private final MutableLiveData<ApiResponse<Void>> uploadOnlineStatus = new MutableLiveData<>();
    private final MutableLiveData<String> errorMessage = new MutableLiveData<>();
    public void resetPassword(ResetPasswordRequest request){
        repository.resetPassword(request, new Callback<ApiResponse<Void>>() {
            @Override
            public void onResponse(Call<ApiResponse<Void>> call, Response<ApiResponse<Void>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    resetPasswordResponse.setValue(response.body());
                } else {
                    errorMessage.setValue("Đổi mật khẩu thất bại");
                }
            }
            @Override
            public void onFailure(Call<ApiResponse<Void>> call, Throwable t) {
                errorMessage.setValue(t.getMessage());
            }
        });
    }

    public LiveData<ApiResponse<Void>> getResetPasswordResponse() {
        return resetPasswordResponse;
    }
    public LiveData<String> getErrorMessage() {
        return errorMessage;
    }
}

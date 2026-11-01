package com.example.ptitdelivery.viewmodel;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.example.ptitdelivery.model.Responses.ApiResponse.ApiResponse;
import com.example.ptitdelivery.model.Requests.ForgetPasswordRequest;
import com.example.ptitdelivery.repositories.AuthRepository;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ForgetPasswordViewModel extends ViewModel {
    private AuthRepository repository;
    public ForgetPasswordViewModel() {
        this.repository = new AuthRepository();
    }
    private final MutableLiveData<ApiResponse<Void>> forgetPasswordResponse = new MutableLiveData<>();
    private final MutableLiveData<String> errorMessage = new MutableLiveData<>();
    public void forgetPassword(ForgetPasswordRequest request){
        repository.forgetPassword(request, new Callback<ApiResponse<Void>>() {
            @Override
            public void onResponse(Call<ApiResponse<Void>> call, Response<ApiResponse<Void>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    forgetPasswordResponse.setValue(response.body());
                } else {
                    errorMessage.setValue("Gửi email thất bại");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Void>> call, Throwable t) {
                errorMessage.setValue(t.getMessage());
            }
        });
    }
    public LiveData<ApiResponse<Void>> getForgetPasswordResponse() {
        return forgetPasswordResponse;
    }
    public LiveData<String> getErrorMessage() {
        return errorMessage;
    }

}

package com.example.ptitdelivery.viewmodel;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.example.ptitdelivery.model.Responses.ApiResponse.ApiResponse;
import com.example.ptitdelivery.model.LoginData;
import com.example.ptitdelivery.repositories.AuthRepository;

public class LoginViewModel extends ViewModel {
    private final AuthRepository repository;
    public LoginViewModel(AuthRepository repository) {
        this.repository = repository;
    }
    private final MutableLiveData<ApiResponse<LoginData>> loginResponse = new MutableLiveData<>();
    private final MutableLiveData<String> loginError = new MutableLiveData<>();
    public void login(String email, String password) {
        repository.login(email, password, new AuthRepository.LoginCallback() {
            @Override
            public void onSuccess(ApiResponse<LoginData> response) {
                loginResponse.postValue(response);
            }

            @Override
            public void onFailure(String errorMessage) {
                loginError.postValue(errorMessage);
            }
        });
    }

    public LiveData<ApiResponse<LoginData>> getLoginResponse() {
        return loginResponse;
    }

    public LiveData<String> getLoginError() {
        return loginError;
    }
}

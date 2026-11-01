package com.example.ptitdelivery.model.Requests;

public class RefreshTokenRequest {
    private String refreshToken;

    public RefreshTokenRequest(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    public String getRefreshToken() {
        return refreshToken;
    }
}

package com.example.ptitdelivery.model;

public class RefreshTokenResponse {
    private String _id;
    private String token;

    public String get_id() {
        return _id;
    }

    public void set_id(String _id) {
        this._id = _id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

}

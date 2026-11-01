package com.example.ptitdelivery.model.Requests;

import java.io.Serializable;

public class VerifyOldPasswordRequest implements Serializable {
    private String oldPassword;

    public VerifyOldPasswordRequest(String oldPassword) {
        this.oldPassword = oldPassword;
    }

    public String getOldPassword() {
        return oldPassword;
    }
}

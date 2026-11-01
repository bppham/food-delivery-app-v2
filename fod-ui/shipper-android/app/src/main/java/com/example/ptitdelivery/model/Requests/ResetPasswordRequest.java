package com.example.ptitdelivery.model.Requests;

import java.io.Serializable;

public class ResetPasswordRequest implements Serializable {
    private String email;
    private String newPassword;

    public ResetPasswordRequest(String email, String newPassword) {
        this.email = email;
        this.newPassword = newPassword;
    }
}

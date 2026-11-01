package com.example.ptitdelivery.model.Requests;

import java.io.Serializable;

public class ChangePasswordRequest implements Serializable {
    private String currentPassword;
    private String newPassword;

    public ChangePasswordRequest(String currentPassword, String newPassword) {
        this.currentPassword = currentPassword;
        this.newPassword = newPassword;
    }
}

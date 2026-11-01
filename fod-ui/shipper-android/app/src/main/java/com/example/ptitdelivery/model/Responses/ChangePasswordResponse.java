package com.example.ptitdelivery.model.Responses;

import java.io.Serializable;

public class ChangePasswordResponse implements Serializable {
    private String status;
    private String message;
    private String shipperId;

    public String getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }

    public String getShipperId() {
        return shipperId;
    }
}

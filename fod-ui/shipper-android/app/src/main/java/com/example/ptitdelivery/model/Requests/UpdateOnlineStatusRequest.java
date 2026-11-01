package com.example.ptitdelivery.model.Requests;

import java.io.Serializable;

public class UpdateOnlineStatusRequest implements Serializable {
    private boolean online;

    public UpdateOnlineStatusRequest(boolean online) {
        this.online = online;
    }

    public boolean isOnline() {
        return online;
    }

    public void setOnline(boolean online) {
        this.online = online;
    }
}

package com.example.ptitdelivery.model;

import com.google.gson.annotations.SerializedName;

import java.io.Serializable;

public class Avatar implements Serializable {
    @SerializedName("_id")
    private String id;
    private String url;
    private String filePath;

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    @Override
    public String toString() {
        return "Avatar{" +
                "id='" + id + '\'' +
                ", url='" + url + '\'' +
                ", filePath='" + filePath + '\'' +
                '}';
    }
}

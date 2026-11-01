package com.example.ptitdelivery.model;

import com.google.gson.annotations.SerializedName;

import java.io.Serializable;

public class Shipper implements Serializable {
    @SerializedName("_id")
    private String id;
    @SerializedName("name")
    private String name;
    @SerializedName("email")
    private String email;
    @SerializedName("avatarImage")
    private Avatar avatar;
    @SerializedName("phonenumber")
    private String phonenumber;
    @SerializedName("password")
    private String password;
    @SerializedName("gender")
    private String gender;
    @SerializedName("status")
    private String status;
    @SerializedName("vehicleId")
    private Vehicle vehicle;
    @SerializedName("refreshToken")
    private String refreshToken;
    @SerializedName("online")
    private boolean online;


    public String getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPhonenumber() {
        return phonenumber;
    }

    public String getPassword() {
        return password;
    }

    public String getGender() {
        return gender;
    }

    public String getStatus() {
        return status;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public String getName() {
        return name;
    }

    public Avatar getAvatar() {
        return avatar;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setAvatar(Avatar avatar) {
        this.avatar = avatar;
    }

    public void setPhonenumber(String phonenumber) {
        this.phonenumber = phonenumber;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public boolean isOnline() {
        return online;
    }

    public void setOnline(boolean online) {
        this.online = online;
    }
}

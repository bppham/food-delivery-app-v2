package com.example.ptitdelivery.model.Requests;

import com.google.gson.annotations.SerializedName;

import java.io.Serializable;

public class ShipperRegisterRequest implements Serializable {
    @SerializedName("name")
    private String name;
    @SerializedName("email")
    private String email;
    @SerializedName("phonenumber")
    private String phonenumber;
    @SerializedName("password")
    private String password;
    @SerializedName("gender")
    private String gender;
    @SerializedName("address")
    private String address;

    private String vehicleNumber;

    private String vehicleType;

    public String getName() {
        return name;
    }

    public ShipperRegisterRequest(String name, String email, String phonenumber, String password, String gender, String address, String vehicleNumber, String vehicleType) {
        this.name = name;
        this.email = email;
        this.phonenumber = phonenumber;
        this.password = password;
        this.gender = gender;
        this.address = address;
        this.vehicleNumber = vehicleNumber;
        this.vehicleType = vehicleType;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhonenumber() {
        return phonenumber;
    }

    public void setPhonenumber(String phonenumber) {
        this.phonenumber = phonenumber;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }
}

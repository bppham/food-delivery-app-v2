package com.example.ptitdelivery.model.Requests;

import com.example.ptitdelivery.model.Avatar;
import com.example.ptitdelivery.model.Vehicle;
import com.google.gson.annotations.SerializedName;

import java.io.Serializable;

public class ShipperUpdationRequest implements Serializable {
    @SerializedName("name")
    private String name;
    @SerializedName("email")
    private String email;
    private Avatar avatarImage;
    @SerializedName("phonenumber")
    private String phonenumber;
    @SerializedName("gender")
    private String gender;
    private String vehicleNumber;
    private String vehicleType;


    public ShipperUpdationRequest() {
    }

    public ShipperUpdationRequest(String name, String email, Avatar avatarImage, String phonenumber, String gender, String vehicleNumber, String vehicleType) {
        this.name = name;
        this.email = email;
        this.avatarImage = avatarImage;
        this.phonenumber = phonenumber;
        this.gender = gender;
        this.vehicleNumber = vehicleNumber;
        this.vehicleType = vehicleType;
    }

    public String getName() {
        return name;
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

    public Avatar getAvatarImage() {
        return avatarImage;
    }

    public void setAvatarImage(Avatar avatarImage) {
        this.avatarImage = avatarImage;
    }

    public String getPhonenumber() {
        return phonenumber;
    }

    public void setPhonenumber(String phonenumber) {
        this.phonenumber = phonenumber;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
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

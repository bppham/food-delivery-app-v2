package com.example.ptitdelivery.model;

import com.google.gson.annotations.SerializedName;

import java.io.Serializable;
import java.util.List;

public class Store implements Serializable {
    @SerializedName("_id")
    private String id;
    private String name;
    private String owner;
    private String description;
    private Location location;
    @SerializedName("avatarImage")
    private Avatar avatar;
    private Avatar cover;
    private List<String> storeCategory;
    private String createdAt;
    private String updatedAt;
    private List<String> staff;
    @SerializedName("address_full")
    private String addressFull;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Avatar getCover() {
        return cover;
    }

    public void setCover(Avatar cover) {
        this.cover = cover;
    }

    public Avatar getAvatar() {
        return avatar;
    }

    public void setAvatar(Avatar avatar) {
        this.avatar = avatar;
    }

    public List<String> getStoreCategory() {
        return storeCategory;
    }

    public void setStoreCategory(List<String> storeCategory) {
        this.storeCategory = storeCategory;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<String> getStaff() {
        return staff;
    }

    public void setStaff(List<String> staff) {
        this.staff = staff;
    }

    public String getAddressFull() {
        return addressFull;
    }

    public void setAddressFull(String addressFull) {
        this.addressFull = addressFull;
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
    }
}

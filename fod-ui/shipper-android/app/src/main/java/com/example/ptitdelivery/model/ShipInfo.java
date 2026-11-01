package com.example.ptitdelivery.model;

import com.google.gson.annotations.SerializedName;

import java.io.Serializable;

public class ShipInfo implements Serializable {
    @SerializedName("_id")
    private String id;
    private String orderId;

    private String address;

    private String detailAddress;

    private String contactName;
    private String contactPhonenumber;
    private ShipLocation shipLocation;

    private String note;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getDetailAddress() {
        return detailAddress;
    }

    public void setDetailAddress(String detailAddress) {
        this.detailAddress = detailAddress;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getContactPhonenumber() {
        return contactPhonenumber;
    }

    public void setContactPhonenumber(String contactPhonenumber) {
        this.contactPhonenumber = contactPhonenumber;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public ShipLocation getShipLocation() {
        return shipLocation;
    }

    public void setShipLocation(ShipLocation shipLocation) {
        this.shipLocation = shipLocation;
    }


}

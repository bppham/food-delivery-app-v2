package com.example.ptitdelivery.model;

import java.io.Serializable;
import java.util.List;

public class Location implements Serializable {
    private String type;
    private double lat;
    private double lon;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public double getLat() {
        return lat;
    }

    public void setLat(double lat) {
        this.lat = lat;
    }

    public double getLon() {
        return lon;
    }

    public void setLon(double lon) {
        this.lon = lon;
    }
}

package com.example.ptitdelivery.model;

import java.io.Serializable;
import java.util.List;

public class DeliveredOrderResponse implements Serializable {
    private boolean success;
    private int page;
    private int totalPages;
    private int totalOrders;
    private List<Order> data;

    public DeliveredOrderResponse(boolean success, int page, int totalPages, int totalOrders, List<Order> data) {
        this.success = success;
        this.page = page;
        this.totalPages = totalPages;
        this.totalOrders = totalOrders;
        this.data = data;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public int getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(int totalOrders) {
        this.totalOrders = totalOrders;
    }

    public List<Order> getData() {
        return data;
    }

    public void setData(List<Order> data) {
        this.data = data;
    }
}

package com.example.ptitdelivery.model.Responses.ApiResponse;

import com.google.gson.annotations.SerializedName;

public class Meta {
    @SerializedName("status")
    private int status;

    // Các trường khác nếu có
    // @SerializedName("total") private int total;
    private int totalItems;
    private int totalPages;

    private int currentPage ;

    private int limit;

    public int getStatus() { return status; }

    public void setStatus(int status) {
        this.status = status;
    }

    public int getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(int totalItems) {
        this.totalItems = totalItems;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }

    public int getLimit() {
        return limit;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }
}

package com.example.orderapi.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.List;

public class CreateOrderRequest {

    @NotNull
    private Long customerId;

    @NotEmpty
    private List<CreateOrderItemRequest> items = new ArrayList<>();

    public CreateOrderRequest() {
    }

    public CreateOrderRequest(Long customerId, List<CreateOrderItemRequest> items) {
        this.customerId = customerId;
        this.items = items;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public List<CreateOrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<CreateOrderItemRequest> items) {
        this.items = items;
    }
}

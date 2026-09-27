package com.example.orderapi.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderNumber,
        Long customerId,
        String customerName,
        String status,
        BigDecimal subtotal,
        BigDecimal discountAmount,
        BigDecimal total,
        Instant createdAt,
        List<OrderItemResponse> items
) {
}

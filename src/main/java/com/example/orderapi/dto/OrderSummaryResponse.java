package com.example.orderapi.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record OrderSummaryResponse(
        Long id,
        String orderNumber,
        String status,
        BigDecimal total,
        int unitCount,
        Instant createdAt
) {
}

package com.example.orderapi.dto;

public record CustomerResponse(
        Long id,
        String fullName,
        String email,
        String tier
) {
}

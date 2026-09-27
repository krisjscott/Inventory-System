package com.example.orderapi;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ErrorHandlingTest extends IntegrationTestSupport {

    @Test
    @DisplayName("requesting a product that does not exist returns 404")
    void unknownProductReturnsNotFound() throws Exception {
        mockMvc.perform(get("/api/products/{id}", 999_999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    @DisplayName("requesting a customer that does not exist returns 404")
    void unknownCustomerReturnsNotFound() throws Exception {
        mockMvc.perform(get("/api/customers/{id}", 999_999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("requesting an order that does not exist returns 404")
    void unknownOrderReturnsNotFound() throws Exception {
        mockMvc.perform(get("/api/orders/{id}", 999_999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("an unknown customer id on order creation returns 404")
    void orderingForUnknownCustomerReturnsNotFound() throws Exception {
        Long productId = productForSku("SKU-1004").getId();

        mockMvc.perform(post("/api/orders")
                        .contentType(contentType())
                        .content(orderPayload(999_999L, productId, 1)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("a blank body is reported as a bad request, not a server error")
    void blankBodyIsBadRequest() throws Exception {
        mockMvc.perform(post("/api/orders")
                        .contentType(contentType())
                        .content(""))
                .andExpect(status().isBadRequest());
    }
}

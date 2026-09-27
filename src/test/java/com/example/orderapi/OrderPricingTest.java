package com.example.orderapi;

import com.example.orderapi.domain.Product;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class OrderPricingTest extends IntegrationTestSupport {

    @Test
    @DisplayName("platinum customers receive the 20% tier discount")
    void platinumCustomerReceivesTwentyPercentDiscount() throws Exception {
        Long customerId = customerIdForEmail("carol@example.com");
        Product keyboard = productForSku("SKU-1001");

        // 2 x 89.99 = 179.98 subtotal, 20% = 36.00 discount, 143.98 total
        mockMvc.perform(post("/api/orders")
                        .contentType(contentType())
                        .content(orderPayload(customerId, keyboard.getId(), 2)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.subtotal").value(179.98))
                .andExpect(jsonPath("$.discountAmount").value(36.00))
                .andExpect(jsonPath("$.total").value(143.98));
    }

    @Test
    @DisplayName("gold customers receive the 10% tier discount")
    void goldCustomerReceivesTenPercentDiscount() throws Exception {
        Long customerId = customerIdForEmail("alice@example.com");
        Product keyboard = productForSku("SKU-1001");

        // 1 x 89.99 = 89.99 subtotal, 10% = 9.00 discount, 80.99 total
        mockMvc.perform(post("/api/orders")
                        .contentType(contentType())
                        .content(orderPayload(customerId, keyboard.getId(), 1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.subtotal").value(89.99))
                .andExpect(jsonPath("$.discountAmount").value(9.00))
                .andExpect(jsonPath("$.total").value(80.99));
    }

    @Test
    @DisplayName("standard customers pay full price")
    void standardCustomerPaysFullPrice() throws Exception {
        Long customerId = customerIdForEmail("bob@example.com");
        Product keyboard = productForSku("SKU-1001");

        mockMvc.perform(post("/api/orders")
                        .contentType(contentType())
                        .content(orderPayload(customerId, keyboard.getId(), 1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.subtotal").value(89.99))
                .andExpect(jsonPath("$.discountAmount").value(0.00))
                .andExpect(jsonPath("$.total").value(89.99));
    }
}

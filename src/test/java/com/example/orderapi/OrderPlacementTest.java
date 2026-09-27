package com.example.orderapi;

import com.example.orderapi.domain.Product;
import com.example.orderapi.repository.OrderRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class OrderPlacementTest extends IntegrationTestSupport {

    @Autowired
    private OrderRepository orderRepository;

    @Test
    @DisplayName("placing a valid order returns 201 with correct totals and decrements stock")
    void placingAValidOrderPersistsTheOrderAndDecrementsStock() throws Exception {
        Long customerId = customerIdForEmail("alice@example.com");
        Product webcam = productForSku("SKU-1004");
        int stockBefore = webcam.getStockQuantity();
        long ordersBefore = orderRepository.count();

        mockMvc.perform(post("/api/orders")
                        .contentType(contentType())
                        .content(orderPayload(customerId, webcam.getId(), 2)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.orderNumber").isNotEmpty())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.subtotal").value(129.90))
                .andExpect(jsonPath("$.discountAmount").value(12.99))
                .andExpect(jsonPath("$.total").value(116.91))
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].quantity").value(2))
                .andExpect(jsonPath("$.items[0].lineTotal").value(129.90));

        assertThat(orderRepository.count()).isEqualTo(ordersBefore + 1);

        int stockAfter = productRepository.findById(webcam.getId()).orElseThrow().getStockQuantity();
        assertThat(stockAfter).isEqualTo(stockBefore - 2);
    }

    @Test
    @DisplayName("ordering more than we have is rejected and leaves no trace behind")
    void orderingMoreThanAvailableIsRejectedAndRollsBackCompletely() throws Exception {
        Long customerId = customerIdForEmail("bob@example.com");
        Product monitor = productForSku("SKU-1003");
        int stockBefore = monitor.getStockQuantity();
        long ordersBefore = orderRepository.count();

        mockMvc.perform(post("/api/orders")
                        .contentType(contentType())
                        .content(orderPayload(customerId, monitor.getId(), stockBefore + 5)))
                .andExpect(status().isConflict());

        assertThat(orderRepository.count())
                .as("a rejected order must not be persisted")
                .isEqualTo(ordersBefore);

        int stockAfter = productRepository.findById(monitor.getId()).orElseThrow().getStockQuantity();
        assertThat(stockAfter)
                .as("stock must be untouched when the order is rejected")
                .isEqualTo(stockBefore);
    }

    @Test
    @DisplayName("a line item with a negative quantity is rejected as a bad request")
    void negativeQuantityIsRejected() throws Exception {
        Long customerId = customerIdForEmail("bob@example.com");
        Product webcam = productForSku("SKU-1004");
        int stockBefore = webcam.getStockQuantity();

        mockMvc.perform(post("/api/orders")
                        .contentType(contentType())
                        .content(orderPayload(customerId, webcam.getId(), -5)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("quantity")));

        int stockAfter = productRepository.findById(webcam.getId()).orElseThrow().getStockQuantity();
        assertThat(stockAfter)
                .as("a rejected request must not change stock")
                .isEqualTo(stockBefore);
    }

    @Test
    @DisplayName("a line item with a zero quantity is rejected as a bad request")
    void zeroQuantityIsRejected() throws Exception {
        Long customerId = customerIdForEmail("bob@example.com");
        Product webcam = productForSku("SKU-1004");

        mockMvc.perform(post("/api/orders")
                        .contentType(contentType())
                        .content(orderPayload(customerId, webcam.getId(), 0)))
                .andExpect(status().isBadRequest());
    }
}

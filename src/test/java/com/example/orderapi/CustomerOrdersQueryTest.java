package com.example.orderapi;

import com.example.orderapi.domain.Customer;
import com.example.orderapi.domain.CustomerTier;
import com.example.orderapi.domain.Product;
import com.example.orderapi.dto.CreateOrderItemRequest;
import com.example.orderapi.dto.CreateOrderRequest;
import com.example.orderapi.service.OrderService;
import jakarta.persistence.EntityManagerFactory;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CustomerOrdersQueryTest extends IntegrationTestSupport {

    private static final int ORDER_COUNT = 10;
    private static final long MAX_ACCEPTABLE_QUERIES = 5;

    @Autowired
    private EntityManagerFactory entityManagerFactory;

    @Autowired
    private OrderService orderService;

    private Long customerId;
    private Long productId;

    @BeforeEach
    void seedOrdersForQueryTest() {
        Customer customer = customerRepository.save(new Customer(
                "Query", "Probe",
                "query-probe-" + System.nanoTime() + "@example.com",
                CustomerTier.STANDARD));
        customerId = customer.getId();

        productId = productRepository.save(new Product(
                "SKU-P-" + Long.toHexString(System.nanoTime()),
                "Probe Widget",
                "created by the query test",
                new BigDecimal("10.00"),
                5_000)).getId();

        for (int i = 0; i < ORDER_COUNT; i++) {
            orderService.placeOrder(new CreateOrderRequest(
                    customerId,
                    List.of(new CreateOrderItemRequest(productId, 1))));
        }
    }

    @Test
    @DisplayName("listing a customer's orders does not scale queries with the number of orders")
    void listingCustomerOrdersRunsAFixedNumberOfQueries() throws Exception {
        Statistics statistics = entityManagerFactory.unwrap(SessionFactory.class).getStatistics();
        statistics.clear();

        mockMvc.perform(get("/api/customers/{id}/orders", customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(ORDER_COUNT));

        long statementCount = statistics.getPrepareStatementCount();
        long collectionLoads = statistics.getCollectionLoadCount();
        System.out.println("[perf] listing " + ORDER_COUNT + " orders issued "
                + statementCount + " SQL statements (" + collectionLoads + " collection loads)");

        assertThat(statementCount)
                .as("the order summary listing should not issue one query per order")
                .isLessThanOrEqualTo(MAX_ACCEPTABLE_QUERIES);
    }
}

package com.example.orderapi;

import com.example.orderapi.model.Customer;
import com.example.orderapi.model.CustomerTier;
import com.example.orderapi.model.Product;
import com.example.orderapi.dto.CreateOrderItemRequest;
import com.example.orderapi.dto.CreateOrderRequest;
import com.example.orderapi.repository.CustomerRepository;
import com.example.orderapi.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ConcurrentStockTest {

    private static final int ROUNDS = 6;

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Test
    @DisplayName("the last unit in stock can only be sold once, even under concurrent requests")
    void lastUnitCannotBeSoldTwice() throws Exception {
        List<String> failures = new ArrayList<>();

        for (int round = 1; round <= ROUNDS; round++) {
            Long customerId = newCustomer();
            Product scarce = productRepository.save(new Product(
                    "SKU-R-" + UUID.randomUUID().toString().substring(0, 8),
                    "Last One In Stock",
                    "only one unit available",
                    new BigDecimal("25.00"),
                    1));

            List<HttpStatus> statuses = raceTwoOrders(customerId, scarce.getId());

            long created = statuses.stream()
                    .filter(s -> s.is2xxSuccessful())
                    .count();

            if (created != 1) {
                failures.add("round " + round + ": expected exactly 1 successful order but got "
                        + created + " (statuses " + statuses + ")");
            }

            HttpStatus rejected = statuses.stream()
                    .filter(s -> !s.is2xxSuccessful())
                    .findFirst()
                    .orElse(null);
            if (rejected != HttpStatus.CONFLICT) {
                failures.add("round " + round + ": expected the losing request to be rejected with "
                        + HttpStatus.CONFLICT + " but got " + rejected);
            }

            int stockLeft = productRepository.findById(scarce.getId()).orElseThrow().getStockQuantity();
            if (stockLeft != 0) {
                failures.add("round " + round + ": expected stock to end at 0 but was " + stockLeft);
            }
        }

        assertThat(failures).isEmpty();
    }

    private List<HttpStatus> raceTwoOrders(Long customerId, Long productId) throws Exception {
        CreateOrderRequest request = new CreateOrderRequest(
                customerId, List.of(new CreateOrderItemRequest(productId, 1)));

        CyclicBarrier barrier = new CyclicBarrier(2);
        ExecutorService pool = Executors.newFixedThreadPool(2);

        try {
            Callable<HttpStatus> task = () -> {
                barrier.await();
                ResponseEntity<String> response = restTemplate.postForEntity(
                        "http://localhost:" + port + "/api/orders", request, String.class);
                return HttpStatus.valueOf(response.getStatusCode().value());
            };

            Future<HttpStatus> first = pool.submit(task);
            Future<HttpStatus> second = pool.submit(task);

            return List.of(first.get(), second.get());
        } finally {
            pool.shutdownNow();
        }
    }

    private Long newCustomer() {
        return customerRepository.save(new Customer(
                "Race", "Tester",
                "race-" + UUID.randomUUID() + "@example.com",
                CustomerTier.STANDARD)).getId();
    }
}

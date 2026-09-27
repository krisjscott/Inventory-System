package com.example.orderapi;

import com.example.orderapi.domain.Product;
import com.example.orderapi.repository.CustomerRepository;
import com.example.orderapi.repository.ProductRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

@SpringBootTest
@AutoConfigureMockMvc
abstract class IntegrationTestSupport {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected CustomerRepository customerRepository;

    @Autowired
    protected ProductRepository productRepository;

    protected Long customerIdForEmail(String email) {
        return customerRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalStateException("Seeded customer missing: " + email))
                .getId();
    }

    protected Product productForSku(String sku) {
        return productRepository.findBySkuIgnoreCase(sku)
                .orElseThrow(() -> new IllegalStateException("Seeded product missing: " + sku));
    }

    protected String orderPayload(Long customerId, Long productId, int quantity) throws Exception {
        Map<String, Object> body = Map.of(
                "customerId", customerId,
                "items", List.of(Map.of("productId", productId, "quantity", quantity))
        );
        return objectMapper.writeValueAsString(body);
    }

    protected String contentType() {
        return MediaType.APPLICATION_JSON_VALUE;
    }
}

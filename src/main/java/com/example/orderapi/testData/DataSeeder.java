package com.example.orderapi.testData;

import com.example.orderapi.model.Customer;
import com.example.orderapi.model.CustomerTier;
import com.example.orderapi.model.Order;
import com.example.orderapi.model.OrderStatus;
import com.example.orderapi.model.Product;
import com.example.orderapi.dto.CreateOrderItemRequest;
import com.example.orderapi.dto.CreateOrderRequest;
import com.example.orderapi.repository.CustomerRepository;
import com.example.orderapi.repository.OrderRepository;
import com.example.orderapi.repository.ProductRepository;
import com.example.orderapi.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;

    public DataSeeder(CustomerRepository customerRepository,
                      ProductRepository productRepository,
                      OrderRepository orderRepository,
                      OrderService orderService) {
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderService = orderService;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) {
            return;
        }

        seedProducts();
        Customer alice = seedCustomer("Alice", "Nguyen", "alice@example.com", CustomerTier.GOLD);
        seedCustomer("Bob", "Ortiz", "bob@example.com", CustomerTier.STANDARD);
        seedCustomer("Carol", "Ibrahim", "carol@example.com", CustomerTier.PLATINUM);
        seedCustomer("Dave", "Lindqvist", "dave@example.com", CustomerTier.STANDARD);

        Product keyboard = productBySku("SKU-1001");
        Product dock = productBySku("SKU-1002");
        Product monitor = productBySku("SKU-1003");
        Product headset = productBySku("SKU-1004");

        placeFor(alice, keyboard, 1, OrderStatus.SHIPPED);
        placeFor(alice, dock, 2, OrderStatus.CONFIRMED);
        placeFor(alice, monitor, 1, OrderStatus.PENDING);
        placeFor(alice, headset, 2, OrderStatus.SHIPPED);
        placeFor(alice, keyboard, 3, OrderStatus.CONFIRMED);
        placeFor(alice, dock, 1, OrderStatus.CANCELLED);

        log.info("Seeded {} products and {} customers", productRepository.count(), customerRepository.count());
    }

    private void seedProducts() {
        productRepository.save(new Product("SKU-1001", "Mechanical Keyboard",
                "87-key tenkeyless, hot-swappable switches", new BigDecimal("89.99"), 25));
        productRepository.save(new Product("SKU-1002", "USB-C Dock",
                "11-in-1 dock with dual HDMI", new BigDecimal("129.50"), 10));
        productRepository.save(new Product("SKU-1003", "27 inch Monitor",
                "QHD IPS panel, 75Hz", new BigDecimal("349.00"), 4));
        productRepository.save(new Product("SKU-1004", "Webcam 1080p",
                "Full HD webcam with privacy shutter", new BigDecimal("64.95"), 40));
        productRepository.save(new Product("SKU-1005", "Noise-Cancelling Headset",
                "Over-ear wireless headset", new BigDecimal("199.99"), 8));
    }

    private Customer seedCustomer(String first, String last, String email, CustomerTier tier) {
        return customerRepository.save(new Customer(first, last, email, tier));
    }

    private Product productBySku(String sku) {
        return productRepository.findBySkuIgnoreCase(sku).orElseThrow();
    }

    private void placeFor(Customer customer, Product product, int quantity, OrderStatus status) {
        List<CreateOrderItemRequest> lines = List.of(new CreateOrderItemRequest(product.getId(), quantity));
        Long orderId = orderService.placeOrder(new CreateOrderRequest(customer.getId(), lines)).id();

        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setStatus(status);
        orderRepository.save(order);
    }
}

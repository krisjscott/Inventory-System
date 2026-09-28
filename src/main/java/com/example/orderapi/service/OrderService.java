package com.example.orderapi.service;

import com.example.orderapi.exception.InsufficientStockException;
import com.example.orderapi.model.Customer;
import com.example.orderapi.model.CustomerTier;
import com.example.orderapi.model.Order;
import com.example.orderapi.model.OrderItem;
import com.example.orderapi.model.OrderStatus;
import com.example.orderapi.model.Product;
import com.example.orderapi.dto.CreateOrderItemRequest;
import com.example.orderapi.dto.CreateOrderRequest;
import com.example.orderapi.dto.OrderItemResponse;
import com.example.orderapi.dto.OrderResponse;
import com.example.orderapi.dto.OrderSummaryResponse;
import com.example.orderapi.exception.ResourceNotFoundException;
import com.example.orderapi.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private static final BigDecimal DISCOUNT_STANDARD = new BigDecimal("0.00");
    private static final BigDecimal DISCOUNT_GOLD = new BigDecimal("0.10");
    private static final BigDecimal DISCOUNT_PLATINUM = new BigDecimal("0.20");

    private final OrderRepository orderRepository;
    private final CustomerService customerService;
    private final ProductService productService;
    private final InventoryService inventoryService;

    public OrderService(OrderRepository orderRepository,
                        CustomerService customerService,
                        ProductService productService,
                        InventoryService inventoryService) {
        this.orderRepository = orderRepository;
        this.customerService = customerService;
        this.productService = productService;
        this.inventoryService = inventoryService;
    }

    public OrderResponse placeOrder(CreateOrderRequest request) {
        Customer customer = customerService.getCustomer(request.getCustomerId());

        Order order = new Order(nextOrderNumber(), customer);
//        order.setStatus(OrderStatus.PENDING);

        for (CreateOrderItemRequest line : request.getItems()) {

            Product product = productService.getProduct(line.getProductId());
            int available = product.getStockQuantity();
            int itemsAskedFor = line.getQuantity();

            if(available < itemsAskedFor) {
                throw new InsufficientStockException("Insufficient stock", available, itemsAskedFor );
            }
            order.addItem(new OrderItem(product, itemsAskedFor, product.getUnitPrice()));
        }

        applyTotals(order, customer);

        Order saved = orderRepository.save(order);

        for (OrderItem item : saved.getItems()) {
            inventoryService.deductStock(item.getProduct(), item.getQuantity());
        }

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderSummaryResponse> findOrderSummaries(Long customerId) {
        List<Order> orders = orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        List<OrderSummaryResponse> summaries = new ArrayList<>();
        for (Order order : orders) {
            summaries.add(new OrderSummaryResponse(
                    order.getId(),
                    order.getOrderNumber(),
                    order.getStatus().name(),
                    order.getTotal(),
                    order.getUnitCount(),
                    order.getCreatedAt()
            ));
        }
        return summaries;
    }

    public void cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    private void applyTotals(Order order, Customer customer) {
        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItem item : order.getItems()) {
            subtotal = subtotal.add(item.getLineTotal());
        }

        BigDecimal rate = resolveDiscountRate(customer.getTier());
        BigDecimal discount = subtotal.multiply(rate).setScale(2, RoundingMode.HALF_UP);

        order.setSubtotal(subtotal);
        order.setDiscountAmount(discount);
        order.setTotal(subtotal.subtract(discount).setScale(2, RoundingMode.HALF_UP));
    }

    private BigDecimal resolveDiscountRate(CustomerTier tier) {
         return switch (tier) {
            case PLATINUM -> DISCOUNT_PLATINUM;
            case GOLD -> DISCOUNT_GOLD;
            default -> DISCOUNT_STANDARD;
        };
    }

    private String nextOrderNumber() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = new ArrayList<>();
        for (OrderItem item : order.getItems()) {
            items.add(new OrderItemResponse(
                    item.getId(),
                    item.getProduct().getId(),
                    item.getProduct().getSku(),
                    item.getProduct().getName(),
                    item.getQuantity(),
                    item.getUnitPriceAtOrderTime(),
                    item.getLineTotal()
            ));
        }
        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getCustomer().getId(),
                order.getCustomer().getFullName(),
                order.getStatus().name(),
                order.getSubtotal(),
                order.getDiscountAmount(),
                order.getTotal(),
                order.getCreatedAt(),
                items
        );
    }
}

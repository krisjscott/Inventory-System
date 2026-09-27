package com.example.orderapi.web;

import com.example.orderapi.dto.CustomerResponse;
import com.example.orderapi.dto.OrderSummaryResponse;
import com.example.orderapi.service.CustomerService;
import com.example.orderapi.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;
    private final OrderService orderService;

    public CustomerController(CustomerService customerService, OrderService orderService) {
        this.customerService = customerService;
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<CustomerResponse>> listCustomers() {
        return ResponseEntity.ok(customerService.listCustomers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getCustomer(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.toResponse(customerService.getCustomer(id)));
    }

    @GetMapping("/{id}/orders")
    public ResponseEntity<List<OrderSummaryResponse>> listCustomerOrders(@PathVariable Long id) {
        customerService.getCustomer(id);
        return ResponseEntity.ok(orderService.findOrderSummaries(id));
    }
}

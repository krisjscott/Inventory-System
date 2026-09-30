package com.example.orderapi.repository;

import com.example.orderapi.model.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"items"})
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    Optional<Order> findByOrderNumber(String orderNumber);

    long countByCustomerId(Long customerId);
}

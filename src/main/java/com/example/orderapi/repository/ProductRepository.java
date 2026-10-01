package com.example.orderapi.repository;

import com.example.orderapi.model.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySkuIgnoreCase(String sku);

    List<Product> findByActiveTrueOrderByNameAsc();

    @Override
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @NonNull
    Optional<Product> findById(@NonNull @Param("productId") Long id);
}

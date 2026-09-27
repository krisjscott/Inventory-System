package com.example.orderapi.service;

import com.example.orderapi.domain.Product;
import com.example.orderapi.dto.ProductResponse;
import com.example.orderapi.exception.ResourceNotFoundException;
import com.example.orderapi.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Product getProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    public Product requireBySku(String sku) {
        return productRepository.findBySkuIgnoreCase(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product with SKU " + sku));
    }

    public List<ProductResponse> listProducts() {
        return productRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getSku(),
                product.getName(),
                product.getDescription(),
                product.getUnitPrice(),
                product.getStockQuantity(),
                product.isInStock()
        );
    }
}

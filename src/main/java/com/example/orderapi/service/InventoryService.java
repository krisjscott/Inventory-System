package com.example.orderapi.service;

import com.example.orderapi.domain.Product;
import com.example.orderapi.exception.InsufficientStockException;
import com.example.orderapi.repository.ProductRepository;
import org.springframework.stereotype.Service;

@Service
public class InventoryService {

    private final ProductRepository productRepository;

    public InventoryService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public void deductStock(Product product, int quantity) {
        int available = product.getStockQuantity();
        if (available < quantity) {
            throw new InsufficientStockException(product.getSku(), available, quantity);
        }
        product.setStockQuantity(available - quantity);
        productRepository.save(product);
    }

    public void restock(Product product, int quantity) {
        product.setStockQuantity(product.getStockQuantity() + quantity);
        productRepository.save(product);
    }
}

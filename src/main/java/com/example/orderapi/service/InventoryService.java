package com.example.orderapi.service;

import com.example.orderapi.exception.NegativeQuantityException;
import com.example.orderapi.model.Product;
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
        else {
            if(quantity <= 0) {
                throw new NegativeQuantityException("Quantity cannot be less than zero");
            }
            product.setStockQuantity(product.getStockQuantity() - quantity);
            productRepository.save(product);
        }
    }

    public void restock(Product product, int quantity) {
        product.setStockQuantity(product.getStockQuantity() + quantity);
        productRepository.save(product);
    }
}

package com.example.orderapi.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public Map<String, String> root() {
        return Map.of(
                "service", "inventory-system-api",
                "status", "running",
                "frontend", "https://inventory-system-kappa-indol.vercel.app"
        );
    }
}

package com.example.orderapi.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/csrf")
    public ResponseEntity<Map<String, String>> csrf(CsrfToken token) {
        return ResponseEntity.ok(Map.of("token", token.getToken()));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> currentUser(@AuthenticationPrincipal OidcUser user) {
        return ResponseEntity.ok(Map.of(
                "subject", user.getSubject(),
                "email", user.getEmail(),
                "name", user.getFullName() == null ? user.getEmail() : user.getFullName()));
    }
}

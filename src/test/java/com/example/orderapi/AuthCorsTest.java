package com.example.orderapi;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

class AuthCorsTest extends IntegrationTestSupport {

    @Test
    void permitsCredentialedApiRequestsFromConfiguredFrontendOrigin() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.options("/api/auth/me")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.header()
                        .string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(MockMvcResultMatchers.header()
                        .string("Access-Control-Allow-Credentials", "true"));
    }
}

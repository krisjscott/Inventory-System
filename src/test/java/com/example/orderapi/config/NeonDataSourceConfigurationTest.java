package com.example.orderapi.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import org.junit.jupiter.api.Test;

class NeonDataSourceConfigurationTest {
    @Test
    void parsesNeonConnectionUrlWithCredentialsInAuthority() {
        NeonDataSourceConfiguration.ParsedConnection connection =
                NeonDataSourceConfiguration.parseConnectionString(
                        "postgresql://neon_user:secret_value@db.example.test:5432/neondb?sslmode=require&channelBinding=require");

        assertEquals("jdbc:postgresql://db.example.test:5432/neondb?sslmode=require&channelBinding=require",
                connection.jdbcUrl());
        assertEquals("neon_user", connection.username());
        assertEquals("secret_value", connection.password());
    }

    @Test
    void parsesJdbcUrlWithCredentialsInQueryAndKeepsCredentialsOutOfJdbcUrl() {
        NeonDataSourceConfiguration.ParsedConnection connection =
                NeonDataSourceConfiguration.parseConnectionString(
                        "jdbc:postgresql://db.example.test/neondb?user=neon_user&password=secret_value&sslmode=require&channelBinding=require");

        assertEquals("jdbc:postgresql://db.example.test/neondb?sslmode=require&channelBinding=require",
                connection.jdbcUrl());
        assertEquals("neon_user", connection.username());
        assertEquals("secret_value", connection.password());
        assertFalse(connection.jdbcUrl().contains("secret_value"));
    }
}

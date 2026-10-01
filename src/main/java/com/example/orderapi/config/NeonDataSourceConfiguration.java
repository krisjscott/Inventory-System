package com.example.orderapi.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import javax.sql.DataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;

@Configuration
@Profile("neon")
public class NeonDataSourceConfiguration {
    @Bean
    DataSource neonDataSource(Environment environment) {
        String connectionString = environment.getRequiredProperty("DATABASE_URL");
        ParsedConnection connection = parseConnectionString(connectionString);

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(connection.jdbcUrl());
        config.setUsername(connection.username());
        config.setPassword(connection.password());
        config.setDriverClassName("org.postgresql.Driver");
        config.setMaximumPoolSize(5);
        return new HikariDataSource(config);
    }

    static ParsedConnection parseConnectionString(String connectionString) {
        String postgresUrl = connectionString.startsWith("jdbc:")
                ? connectionString.substring("jdbc:".length())
                : connectionString;
        URI connectionUri = URI.create(postgresUrl);
        if (!"postgresql".equals(connectionUri.getScheme())
                || connectionUri.getHost() == null
                || connectionUri.getRawPath() == null
                || connectionUri.getRawPath().isBlank()) {
            throw new IllegalArgumentException("DATABASE_URL must be a PostgreSQL URL with a host and database.");
        }

        String username = null;
        String password = null;
        if (connectionUri.getUserInfo() != null) {
            int separator = connectionUri.getUserInfo().indexOf(':');
            if (separator > 0) {
                username = connectionUri.getUserInfo().substring(0, separator);
                password = connectionUri.getUserInfo().substring(separator + 1);
            }
        }

        StringBuilder query = new StringBuilder();
        if (connectionUri.getRawQuery() != null) {
            for (String parameter : connectionUri.getRawQuery().split("&")) {
                int separator = parameter.indexOf('=');
                String key = URLDecoder.decode(
                        separator < 0 ? parameter : parameter.substring(0, separator), StandardCharsets.UTF_8);
                String value = separator < 0 ? "" : parameter.substring(separator + 1);
                if ("user".equalsIgnoreCase(key)) {
                    username = URLDecoder.decode(value, StandardCharsets.UTF_8);
                } else if ("password".equalsIgnoreCase(key)) {
                    password = URLDecoder.decode(value, StandardCharsets.UTF_8);
                } else {
                    if (!query.isEmpty()) {
                        query.append('&');
                    }
                    query.append(parameter);
                }
            }
        }

        if (username == null || username.isBlank() || password == null || password.isEmpty()) {
            throw new IllegalArgumentException("DATABASE_URL must include a username and password.");
        }

        StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://").append(connectionUri.getHost());
        if (connectionUri.getPort() >= 0) {
            jdbcUrl.append(':').append(connectionUri.getPort());
        }
        jdbcUrl.append(connectionUri.getRawPath());
        if (!query.isEmpty()) {
            jdbcUrl.append('?').append(query);
        }
        return new ParsedConnection(jdbcUrl.toString(), username, password);
    }

    record ParsedConnection(String jdbcUrl, String username, String password) {
    }
}

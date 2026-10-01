package com.example.orderapi.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.net.URI;
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
        URI connectionUri = URI.create(connectionString);
        String userInfo = connectionUri.getUserInfo();
        if (!"postgresql".equals(connectionUri.getScheme()) || userInfo == null) {
            throw new IllegalArgumentException(
                    "DATABASE_URL must be a PostgreSQL URL with credentials in its authority.");
        }

        int separator = userInfo.indexOf(':');
        if (separator < 1 || separator == userInfo.length() - 1) {
            throw new IllegalArgumentException("DATABASE_URL must include a username and password.");
        }

        StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://")
                .append(connectionUri.getHost());
        if (connectionUri.getPort() >= 0) {
            jdbcUrl.append(':').append(connectionUri.getPort());
        }
        jdbcUrl.append(connectionUri.getRawPath());
        if (connectionUri.getRawQuery() != null) {
            jdbcUrl.append('?').append(connectionUri.getRawQuery());
        }

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl.toString());
        config.setUsername(userInfo.substring(0, separator));
        config.setPassword(userInfo.substring(separator + 1));
        config.setDriverClassName("org.postgresql.Driver");
        config.setMaximumPoolSize(5);
        return new HikariDataSource(config);
    }
}

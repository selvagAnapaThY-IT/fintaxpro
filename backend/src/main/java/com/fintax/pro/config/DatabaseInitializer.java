package com.fintax.pro.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        logger.info("[DB INITIALIZER] Checking PostgreSQL table schemas and running auto-migrations...");
        try {
            // 1. Ensure email_verified column exists on users table
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT TRUE;");
            
            // 2. Ensure token_version column exists on users table
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INT DEFAULT 0;");
            
            // 3. Ensure verification_codes table exists for OTP verification
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS verification_codes ("
                    + "id BIGSERIAL PRIMARY KEY, "
                    + "user_id BIGINT, "
                    + "email VARCHAR(255) NOT NULL, "
                    + "code_hash VARCHAR(255) NOT NULL, "
                    + "type VARCHAR(50) NOT NULL, "
                    + "expires_at TIMESTAMP NOT NULL, "
                    + "attempts INT NOT NULL DEFAULT 0, "
                    + "used BOOLEAN NOT NULL DEFAULT FALSE, "
                    + "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "
                    + "payload TEXT"
                    + ");");

            logger.info("[DB INITIALIZER] Database schema migration executed successfully: users and verification_codes tables verified.");
        } catch (Exception e) {
            logger.error("[DB INITIALIZER] Error executing database schema migration: {}", e.getMessage(), e);
        }
    }
}

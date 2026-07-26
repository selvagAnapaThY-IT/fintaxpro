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
        logger.info("[DB INITIALIZER] Checking PostgreSQL table schemas for missing columns...");
        try {
            // Ensure email_verified column exists on users table
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT TRUE;");
            
            // Ensure token_version column exists on users table
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INT DEFAULT 0;");
            
            logger.info("[DB INITIALIZER] Database schema migration executed successfully: email_verified and token_version columns verified.");
        } catch (Exception e) {
            logger.error("[DB INITIALIZER] Error executing database schema migration: {}", e.getMessage(), e);
        }
    }
}

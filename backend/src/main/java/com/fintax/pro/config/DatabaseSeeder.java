package com.fintax.pro.config;

import com.fintax.pro.entity.*;
import com.fintax.pro.repository.*;
import com.fintax.pro.service.InsightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private PotTransactionRepository potTransactionRepository;

    @Autowired
    private InsightService insightService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            seedData();
        }
    }

    private void seedData() {
        // 1. Create Demo User
        User user = User.builder()
                .name("Rohan Sharma")
                .email("demo@fintaxpro.in")
                .password(passwordEncoder.encode("password123"))
                .build();
        user = userRepository.save(user);

        // 2. Create Profile
        Profile profile = Profile.builder()
                .user(user)
                .mobile("9876543210")
                .businessType("IT Consultant / Developer")
                .pan("ABCDE1234F")
                .aadhaar("123456789012")
                .gstin("27ABCDE1234F1Z5")
                .city("Mumbai")
                .state("Maharashtra")
                .financialYear("2025-2026")
                .build();
        profileRepository.save(profile);

        // 3. Create realistic transactions
        LocalDate today = LocalDate.now();

        Transaction t1 = Transaction.builder()
                .user(user)
                .type("INCOME")
                .amount(new BigDecimal("150000.00"))
                .description("Acme Corp - Q1 Software Consulting Retainer")
                .category("Consulting")
                .source("bank")
                .tag("BUSINESS")
                .isBusiness(true)
                .gstRate(new BigDecimal("18.00"))
                .date(today.minusDays(45))
                .build();

        Transaction t2 = Transaction.builder()
                .user(user)
                .type("INCOME")
                .amount(new BigDecimal("220000.00"))
                .description("Globex Inc - Backend REST API Development")
                .category("Freelance Income")
                .source("bank")
                .tag("BUSINESS")
                .isBusiness(true)
                .gstRate(new BigDecimal("18.00"))
                .date(today.minusDays(20))
                .build();

        Transaction t3 = Transaction.builder()
                .user(user)
                .type("INCOME")
                .amount(new BigDecimal("95000.00"))
                .description("Startup Inc - UI/UX Prototyping Workshop")
                .category("Consulting")
                .source("UPI")
                .tag("BUSINESS")
                .isBusiness(true)
                .gstRate(new BigDecimal("18.00"))
                .date(today.minusDays(10))
                .build();

        Transaction t4 = Transaction.builder()
                .user(user)
                .type("EXPENSE")
                .amount(new BigDecimal("15000.00"))
                .description("Amazon Web Services - Monthly Hosting Fees")
                .category("SaaS Subscription")
                .source("card")
                .tag("BUSINESS")
                .isBusiness(true)
                .gstRate(new BigDecimal("18.00"))
                .date(today.minusDays(30))
                .build();

        Transaction t5 = Transaction.builder()
                .user(user)
                .type("EXPENSE")
                .amount(new BigDecimal("45000.00"))
                .description("Apple Store - iPad Pro for testing App UI")
                .category("Work Laptop")
                .source("card")
                .tag("BUSINESS")
                .isBusiness(true)
                .gstRate(new BigDecimal("18.00"))
                .date(today.minusDays(25))
                .build();

        Transaction t6 = Transaction.builder()
                .user(user)
                .type("EXPENSE")
                .amount(new BigDecimal("5000.00"))
                .description("WeWork India - Dedicated Coworking Hotdesk")
                .category("Office Rent")
                .source("UPI")
                .tag("BUSINESS")
                .isBusiness(true)
                .gstRate(new BigDecimal("18.00"))
                .date(today.minusDays(15))
                .build();

        Transaction t7 = Transaction.builder()
                .user(user)
                .type("EXPENSE")
                .amount(new BigDecimal("1500.00"))
                .description("GitHub - Copilot Developer Subscription")
                .category("SaaS Subscription")
                .source("card")
                .tag("BUSINESS")
                .isBusiness(true)
                .gstRate(new BigDecimal("18.00"))
                .date(today.minusDays(5))
                .build();

        // Personal Expenses
        Transaction t8 = Transaction.builder()
                .user(user)
                .type("EXPENSE")
                .amount(new BigDecimal("35000.00"))
                .description("Residential Home Rental payment")
                .category("Rent (Home)")
                .source("bank")
                .tag("PERSONAL")
                .isBusiness(false)
                .gstRate(BigDecimal.ZERO)
                .date(today.minusDays(30))
                .build();

        Transaction t9 = Transaction.builder()
                .user(user)
                .type("EXPENSE")
                .amount(new BigDecimal("4500.00"))
                .description("Zomato - Weekend Dinner with Family")
                .category("Dining Out")
                .source("UPI")
                .tag("PERSONAL")
                .isBusiness(false)
                .gstRate(BigDecimal.ZERO)
                .date(today.minusDays(12))
                .build();

        Transaction t10 = Transaction.builder()
                .user(user)
                .type("EXPENSE")
                .amount(new BigDecimal("8000.00"))
                .description("Nature's Basket - Weekly Groceries purchase")
                .category("Groceries")
                .source("card")
                .tag("PERSONAL")
                .isBusiness(false)
                .gstRate(BigDecimal.ZERO)
                .date(today.minusDays(8))
                .build();

        Transaction t11 = Transaction.builder()
                .user(user)
                .type("EXPENSE")
                .amount(new BigDecimal("2500.00"))
                .description("BookMyShow - IMAX Movie Tickets")
                .category("Movies")
                .source("UPI")
                .tag("PERSONAL")
                .isBusiness(false)
                .gstRate(BigDecimal.ZERO)
                .date(today.minusDays(3))
                .build();

        transactionRepository.saveAll(Arrays.asList(t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11));

        // 4. Create Income Smoother simulated transactions
        PotTransaction pt1 = PotTransaction.builder()
                .user(user)
                .type("DEPOSIT")
                .amount(new BigDecimal("20000.00"))
                .description("Initial Buffer - May Allocation")
                .date(today.minusDays(15))
                .build();

        PotTransaction pt2 = PotTransaction.builder()
                .user(user)
                .type("DEPOSIT")
                .amount(new BigDecimal("15000.00"))
                .description("Retainer Project Reserve Transfer")
                .date(today.minusDays(5))
                .build();

        PotTransaction pt3 = PotTransaction.builder()
                .user(user)
                .type("WITHDRAW")
                .amount(new BigDecimal("5000.00"))
                .description("Smoothening payout for Home Rent")
                .date(today.minusDays(2))
                .build();

        potTransactionRepository.saveAll(Arrays.asList(pt1, pt2, pt3));

        // 5. Generate Initial AI Insights
        insightService.regenerateInsights(user);
    }
}

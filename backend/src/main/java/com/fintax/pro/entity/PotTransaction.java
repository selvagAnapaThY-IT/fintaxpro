package com.fintax.pro.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pot_transactions")
public class PotTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String type; // DEPOSIT, WITHDRAW

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public PotTransaction() {}

    public PotTransaction(Long id, User user, String type, BigDecimal amount, String description, LocalDate date, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.type = type;
        this.amount = amount;
        this.description = description;
        this.date = date;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static PotTransactionBuilder builder() {
        return new PotTransactionBuilder();
    }

    public static class PotTransactionBuilder {
        private Long id;
        private User user;
        private String type;
        private BigDecimal amount;
        private String description;
        private LocalDate date;
        private LocalDateTime createdAt;

        public PotTransactionBuilder id(Long id) { this.id = id; return this; }
        public PotTransactionBuilder user(User user) { this.user = user; return this; }
        public PotTransactionBuilder type(String type) { this.type = type; return this; }
        public PotTransactionBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
        public PotTransactionBuilder description(String description) { this.description = description; return this; }
        public PotTransactionBuilder date(LocalDate date) { this.date = date; return this; }
        public PotTransactionBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public PotTransaction build() {
            return new PotTransaction(id, user, type, amount, description, date, createdAt);
        }
    }
}

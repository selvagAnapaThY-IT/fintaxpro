package com.fintax.pro.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String type; // INCOME, EXPENSE

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String source; // UPI, bank, SMS, card, manual

    @Column(nullable = false)
    private String tag; // BUSINESS, PERSONAL

    @Column(name = "is_business", nullable = false)
    private Boolean isBusiness;

    @Column(name = "gst_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal gstRate;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Transaction() {}

    public Transaction(Long id, User user, String type, BigDecimal amount, String description, String category, String source, String tag, Boolean isBusiness, BigDecimal gstRate, LocalDate date, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.type = type;
        this.amount = amount;
        this.description = description;
        this.category = category;
        this.source = source;
        this.tag = tag;
        this.isBusiness = isBusiness;
        this.gstRate = gstRate;
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

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }

    public Boolean getIsBusiness() { return isBusiness; }
    public void setIsBusiness(Boolean business) { isBusiness = business; }

    public BigDecimal getGstRate() { return gstRate; }
    public void setGstRate(BigDecimal gstRate) { this.gstRate = gstRate; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static TransactionBuilder builder() {
        return new TransactionBuilder();
    }

    public static class TransactionBuilder {
        private Long id;
        private User user;
        private String type;
        private BigDecimal amount;
        private String description;
        private String category;
        private String source;
        private String tag;
        private Boolean isBusiness;
        private BigDecimal gstRate;
        private LocalDate date;
        private LocalDateTime createdAt;

        public TransactionBuilder id(Long id) { this.id = id; return this; }
        public TransactionBuilder user(User user) { this.user = user; return this; }
        public TransactionBuilder type(String type) { this.type = type; return this; }
        public TransactionBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
        public TransactionBuilder description(String description) { this.description = description; return this; }
        public TransactionBuilder category(String category) { this.category = category; return this; }
        public TransactionBuilder source(String source) { this.source = source; return this; }
        public TransactionBuilder tag(String tag) { this.tag = tag; return this; }
        public TransactionBuilder isBusiness(Boolean isBusiness) { this.isBusiness = isBusiness; return this; }
        public TransactionBuilder gstRate(BigDecimal gstRate) { this.gstRate = gstRate; return this; }
        public TransactionBuilder date(LocalDate date) { this.date = date; return this; }
        public TransactionBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Transaction build() {
            return new Transaction(id, user, type, amount, description, category, source, tag, isBusiness, gstRate, date, createdAt);
        }
    }
}

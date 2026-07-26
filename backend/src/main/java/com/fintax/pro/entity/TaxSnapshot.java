package com.fintax.pro.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tax_snapshots")
public class TaxSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String period; // e.g. "Q1 FY26", "FY26"

    @Column(name = "gst_output", nullable = false, precision = 12, scale = 2)
    private BigDecimal gstOutput;

    @Column(name = "gst_input", nullable = false, precision = 12, scale = 2)
    private BigDecimal gstInput;

    @Column(name = "gst_payable", nullable = false, precision = 12, scale = 2)
    private BigDecimal gstPayable;

    @Column(name = "income_tax_estimate", nullable = false, precision = 12, scale = 2)
    private BigDecimal incomeTaxEstimate;

    @Column(name = "advance_tax_estimate", nullable = false, precision = 12, scale = 2)
    private BigDecimal advanceTaxEstimate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public TaxSnapshot() {}

    public TaxSnapshot(Long id, User user, String period, BigDecimal gstOutput, BigDecimal gstInput, BigDecimal gstPayable, BigDecimal incomeTaxEstimate, BigDecimal advanceTaxEstimate, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.period = period;
        this.gstOutput = gstOutput;
        this.gstInput = gstInput;
        this.gstPayable = gstPayable;
        this.incomeTaxEstimate = incomeTaxEstimate;
        this.advanceTaxEstimate = advanceTaxEstimate;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public BigDecimal getGstOutput() { return gstOutput; }
    public void setGstOutput(BigDecimal gstOutput) { this.gstOutput = gstOutput; }

    public BigDecimal getGstInput() { return gstInput; }
    public void setGstInput(BigDecimal gstInput) { this.gstInput = gstInput; }

    public BigDecimal getGstPayable() { return gstPayable; }
    public void setGstPayable(BigDecimal gstPayable) { this.gstPayable = gstPayable; }

    public BigDecimal getIncomeTaxEstimate() { return incomeTaxEstimate; }
    public void setIncomeTaxEstimate(BigDecimal incomeTaxEstimate) { this.incomeTaxEstimate = incomeTaxEstimate; }

    public BigDecimal getAdvanceTaxEstimate() { return advanceTaxEstimate; }
    public void setAdvanceTaxEstimate(BigDecimal advanceTaxEstimate) { this.advanceTaxEstimate = advanceTaxEstimate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static TaxSnapshotBuilder builder() {
        return new TaxSnapshotBuilder();
    }

    public static class TaxSnapshotBuilder {
        private Long id;
        private User user;
        private String period;
        private BigDecimal gstOutput;
        private BigDecimal gstInput;
        private BigDecimal gstPayable;
        private BigDecimal incomeTaxEstimate;
        private BigDecimal advanceTaxEstimate;
        private LocalDateTime createdAt;

        public TaxSnapshotBuilder id(Long id) { this.id = id; return this; }
        public TaxSnapshotBuilder user(User user) { this.user = user; return this; }
        public TaxSnapshotBuilder period(String period) { this.period = period; return this; }
        public TaxSnapshotBuilder gstOutput(BigDecimal gstOutput) { this.gstOutput = gstOutput; return this; }
        public TaxSnapshotBuilder gstInput(BigDecimal gstInput) { this.gstInput = gstInput; return this; }
        public TaxSnapshotBuilder gstPayable(BigDecimal gstPayable) { this.gstPayable = gstPayable; return this; }
        public TaxSnapshotBuilder incomeTaxEstimate(BigDecimal incomeTaxEstimate) { this.incomeTaxEstimate = incomeTaxEstimate; return this; }
        public TaxSnapshotBuilder advanceTaxEstimate(BigDecimal advanceTaxEstimate) { this.advanceTaxEstimate = advanceTaxEstimate; return this; }
        public TaxSnapshotBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public TaxSnapshot build() {
            return new TaxSnapshot(id, user, period, gstOutput, gstInput, gstPayable, incomeTaxEstimate, advanceTaxEstimate, createdAt);
        }
    }
}

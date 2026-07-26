package com.fintax.pro.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "exports")
public class ExportRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "export_type", nullable = false)
    private String exportType; // CSV, GST_REPORT

    @Column(name = "period_start")
    private LocalDate periodStart;

    @Column(name = "period_end")
    private LocalDate periodEnd;

    @Column(nullable = false)
    private String filename;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public ExportRecord() {}

    public ExportRecord(Long id, User user, String exportType, LocalDate periodStart, LocalDate periodEnd, String filename, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.exportType = exportType;
        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
        this.filename = filename;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getExportType() { return exportType; }
    public void setExportType(String exportType) { this.exportType = exportType; }

    public LocalDate getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDate periodStart) { this.periodStart = periodStart; }

    public LocalDate getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(LocalDate periodEnd) { this.periodEnd = periodEnd; }

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static ExportRecordBuilder builder() {
        return new ExportRecordBuilder();
    }

    public static class ExportRecordBuilder {
        private Long id;
        private User user;
        private String exportType;
        private LocalDate periodStart;
        private LocalDate periodEnd;
        private String filename;
        private LocalDateTime createdAt;

        public ExportRecordBuilder id(Long id) { this.id = id; return this; }
        public ExportRecordBuilder user(User user) { this.user = user; return this; }
        public ExportRecordBuilder exportType(String exportType) { this.exportType = exportType; return this; }
        public ExportRecordBuilder periodStart(LocalDate periodStart) { this.periodStart = periodStart; return this; }
        public ExportRecordBuilder periodEnd(LocalDate periodEnd) { this.periodEnd = periodEnd; return this; }
        public ExportRecordBuilder filename(String filename) { this.filename = filename; return this; }
        public ExportRecordBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public ExportRecord build() {
            return new ExportRecord(id, user, exportType, periodStart, periodEnd, filename, createdAt);
        }
    }
}

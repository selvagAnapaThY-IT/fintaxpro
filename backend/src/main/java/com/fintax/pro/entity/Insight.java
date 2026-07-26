package com.fintax.pro.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "insights")
public class Insight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String type; // GST, TAX, POT, GENERAL

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(nullable = false)
    private String priority; // HIGH, MEDIUM, LOW

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Insight() {}

    public Insight(Long id, User user, String type, String title, String message, String priority, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.type = type;
        this.title = title;
        this.message = message;
        this.priority = priority;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static InsightBuilder builder() {
        return new InsightBuilder();
    }

    public static class InsightBuilder {
        private Long id;
        private User user;
        private String type;
        private String title;
        private String message;
        private String priority;
        private LocalDateTime createdAt;

        public InsightBuilder id(Long id) { this.id = id; return this; }
        public InsightBuilder user(User user) { this.user = user; return this; }
        public InsightBuilder type(String type) { this.type = type; return this; }
        public InsightBuilder title(String title) { this.title = title; return this; }
        public InsightBuilder message(String message) { this.message = message; return this; }
        public InsightBuilder priority(String priority) { this.priority = priority; return this; }
        public InsightBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Insight build() {
            return new Insight(id, user, type, title, message, priority, createdAt);
        }
    }
}

package com.fintax.pro.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "verification_codes")
public class VerificationCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false)
    private String email;

    @Column(name = "code_hash", nullable = false)
    private String codeHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationType type;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private int attempts = 0;

    @Column(nullable = false)
    private boolean used = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(columnDefinition = "TEXT")
    private String payload;

    public VerificationCode() {}

    public VerificationCode(Long id, Long userId, String email, String codeHash, VerificationType type, LocalDateTime expiresAt, int attempts, boolean used, LocalDateTime createdAt, String payload) {
        this.id = id;
        this.userId = userId;
        this.email = email;
        this.codeHash = codeHash;
        this.type = type;
        this.expiresAt = expiresAt;
        this.attempts = attempts;
        this.used = used;
        this.createdAt = createdAt;
        this.payload = payload;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCodeHash() { return codeHash; }
    public void setCodeHash(String codeHash) { this.codeHash = codeHash; }

    public VerificationType getType() { return type; }
    public void setType(VerificationType type) { this.type = type; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public int getAttempts() { return attempts; }
    public void setAttempts(int attempts) { this.attempts = attempts; }

    public boolean isUsed() { return used; }
    public void setUsed(boolean used) { this.used = used; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }

    // Builder
    public static VerificationCodeBuilder builder() {
        return new VerificationCodeBuilder();
    }

    public static class VerificationCodeBuilder {
        private Long id;
        private Long userId;
        private String email;
        private String codeHash;
        private VerificationType type;
        private LocalDateTime expiresAt;
        private int attempts = 0;
        private boolean used = false;
        private LocalDateTime createdAt;
        private String payload;

        public VerificationCodeBuilder id(Long id) { this.id = id; return this; }
        public VerificationCodeBuilder userId(Long userId) { this.userId = userId; return this; }
        public VerificationCodeBuilder email(String email) { this.email = email; return this; }
        public VerificationCodeBuilder codeHash(String codeHash) { this.codeHash = codeHash; return this; }
        public VerificationCodeBuilder type(VerificationType type) { this.type = type; return this; }
        public VerificationCodeBuilder expiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; return this; }
        public VerificationCodeBuilder attempts(int attempts) { this.attempts = attempts; return this; }
        public VerificationCodeBuilder used(boolean used) { this.used = used; return this; }
        public VerificationCodeBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public VerificationCodeBuilder payload(String payload) { this.payload = payload; return this; }

        public VerificationCode build() {
            return new VerificationCode(id, userId, email, codeHash, type, expiresAt, attempts, used, createdAt, payload);
        }
    }
}

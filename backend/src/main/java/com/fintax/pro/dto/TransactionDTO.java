package com.fintax.pro.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionDTO {

    private Long id;

    @NotBlank(message = "Type is required")
    private String type; // INCOME, EXPENSE

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Source is required")
    private String source; // UPI, bank, SMS, card, manual

    @NotBlank(message = "Tag is required")
    private String tag; // BUSINESS, PERSONAL

    private Boolean isBusiness;

    private BigDecimal gstRate;

    @NotNull(message = "Date is required")
    private LocalDate date;

    public TransactionDTO() {}

    public TransactionDTO(Long id, String type, BigDecimal amount, String description, String category, String source, String tag, Boolean isBusiness, BigDecimal gstRate, LocalDate date) {
        this.id = id;
        this.type = type;
        this.amount = amount;
        this.description = description;
        this.category = category;
        this.source = source;
        this.tag = tag;
        this.isBusiness = isBusiness;
        this.gstRate = gstRate;
        this.date = date;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    // Builder
    public static TransactionDTOBuilder builder() {
        return new TransactionDTOBuilder();
    }

    public static class TransactionDTOBuilder {
        private Long id;
        private String type;
        private BigDecimal amount;
        private String description;
        private String category;
        private String source;
        private String tag;
        private Boolean isBusiness;
        private BigDecimal gstRate;
        private LocalDate date;

        public TransactionDTOBuilder id(Long id) { this.id = id; return this; }
        public TransactionDTOBuilder type(String type) { this.type = type; return this; }
        public TransactionDTOBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
        public TransactionDTOBuilder description(String description) { this.description = description; return this; }
        public TransactionDTOBuilder category(String category) { this.category = category; return this; }
        public TransactionDTOBuilder source(String source) { this.source = source; return this; }
        public TransactionDTOBuilder tag(String tag) { this.tag = tag; return this; }
        public TransactionDTOBuilder isBusiness(Boolean isBusiness) { this.isBusiness = isBusiness; return this; }
        public TransactionDTOBuilder gstRate(BigDecimal gstRate) { this.gstRate = gstRate; return this; }
        public TransactionDTOBuilder date(LocalDate date) { this.date = date; return this; }

        public TransactionDTO build() {
            return new TransactionDTO(id, type, amount, description, category, source, tag, isBusiness, gstRate, date);
        }
    }
}

package com.fintax.pro.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class AiCategorizeRequestDTO {

    @NotBlank(message = "Description is required")
    private String description;

    private BigDecimal amount;
    private String type; // INCOME or EXPENSE

    public AiCategorizeRequestDTO() {}

    public AiCategorizeRequestDTO(String description, BigDecimal amount, String type) {
        this.description = description;
        this.amount = amount;
        this.type = type;
    }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}

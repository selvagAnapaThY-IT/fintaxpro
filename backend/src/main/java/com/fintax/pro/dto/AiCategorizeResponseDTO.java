package com.fintax.pro.dto;

import java.math.BigDecimal;

public class AiCategorizeResponseDTO {

    private String type;        // INCOME, EXPENSE
    private String category;    // e.g. "SaaS Subscription", "Work Laptop", "Freelance Income"
    private String tag;         // BUSINESS, PERSONAL
    private Boolean isBusiness; // true/false
    private BigDecimal gstRate; // e.g. 18.00, 0.00
    private String reasoning;   // Short explanation from AI

    public AiCategorizeResponseDTO() {}

    public AiCategorizeResponseDTO(String type, String category, String tag, Boolean isBusiness, BigDecimal gstRate, String reasoning) {
        this.type = type;
        this.category = category;
        this.tag = tag;
        this.isBusiness = isBusiness;
        this.gstRate = gstRate;
        this.reasoning = reasoning;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }

    public Boolean getIsBusiness() { return isBusiness; }
    public void setIsBusiness(Boolean isBusiness) { this.isBusiness = isBusiness; }

    public BigDecimal getGstRate() { return gstRate; }
    public void setGstRate(BigDecimal gstRate) { this.gstRate = gstRate; }

    public String getReasoning() { return reasoning; }
    public void setReasoning(String reasoning) { this.reasoning = reasoning; }
}

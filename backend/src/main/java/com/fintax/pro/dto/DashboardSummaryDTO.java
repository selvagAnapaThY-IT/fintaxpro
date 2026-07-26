package com.fintax.pro.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardSummaryDTO {

    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netBusinessIncome;
    private BigDecimal gstPayable;
    private BigDecimal estimatedTax;
    private BigDecimal potBalance;
    private List<TransactionDTO> recentTransactions;
    private List<InsightDTO> insights;

    public DashboardSummaryDTO() {}

    public DashboardSummaryDTO(BigDecimal totalIncome, BigDecimal totalExpenses, BigDecimal netBusinessIncome, BigDecimal gstPayable, BigDecimal estimatedTax, BigDecimal potBalance, List<TransactionDTO> recentTransactions, List<InsightDTO> insights) {
        this.totalIncome = totalIncome;
        this.totalExpenses = totalExpenses;
        this.netBusinessIncome = netBusinessIncome;
        this.gstPayable = gstPayable;
        this.estimatedTax = estimatedTax;
        this.potBalance = potBalance;
        this.recentTransactions = recentTransactions;
        this.insights = insights;
    }

    // Getters and Setters
    public BigDecimal getTotalIncome() { return totalIncome; }
    public void setTotalIncome(BigDecimal totalIncome) { this.totalIncome = totalIncome; }

    public BigDecimal getTotalExpenses() { return totalExpenses; }
    public void setTotalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; }

    public BigDecimal getNetBusinessIncome() { return netBusinessIncome; }
    public void setNetBusinessIncome(BigDecimal netBusinessIncome) { this.netBusinessIncome = netBusinessIncome; }

    public BigDecimal getGstPayable() { return gstPayable; }
    public void setGstPayable(BigDecimal gstPayable) { this.gstPayable = gstPayable; }

    public BigDecimal getEstimatedTax() { return estimatedTax; }
    public void setEstimatedTax(BigDecimal estimatedTax) { this.estimatedTax = estimatedTax; }

    public BigDecimal getPotBalance() { return potBalance; }
    public void setPotBalance(BigDecimal potBalance) { this.potBalance = potBalance; }

    public List<TransactionDTO> getRecentTransactions() { return recentTransactions; }
    public void setRecentTransactions(List<TransactionDTO> recentTransactions) { this.recentTransactions = recentTransactions; }

    public List<InsightDTO> getInsights() { return insights; }
    public void setInsights(List<InsightDTO> insights) { this.insights = insights; }

    // Builder
    public static DashboardSummaryDTOBuilder builder() {
        return new DashboardSummaryDTOBuilder();
    }

    public static class DashboardSummaryDTOBuilder {
        private BigDecimal totalIncome;
        private BigDecimal totalExpenses;
        private BigDecimal netBusinessIncome;
        private BigDecimal gstPayable;
        private BigDecimal estimatedTax;
        private BigDecimal potBalance;
        private List<TransactionDTO> recentTransactions;
        private List<InsightDTO> insights;

        public DashboardSummaryDTOBuilder totalIncome(BigDecimal totalIncome) { this.totalIncome = totalIncome; return this; }
        public DashboardSummaryDTOBuilder totalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; return this; }
        public DashboardSummaryDTOBuilder netBusinessIncome(BigDecimal netBusinessIncome) { this.netBusinessIncome = netBusinessIncome; return this; }
        public DashboardSummaryDTOBuilder gstPayable(BigDecimal gstPayable) { this.gstPayable = gstPayable; return this; }
        public DashboardSummaryDTOBuilder estimatedTax(BigDecimal estimatedTax) { this.estimatedTax = estimatedTax; return this; }
        public DashboardSummaryDTOBuilder potBalance(BigDecimal potBalance) { this.potBalance = potBalance; return this; }
        public DashboardSummaryDTOBuilder recentTransactions(List<TransactionDTO> recentTransactions) { this.recentTransactions = recentTransactions; return this; }
        public DashboardSummaryDTOBuilder insights(List<InsightDTO> insights) { this.insights = insights; return this; }

        public DashboardSummaryDTO build() {
            return new DashboardSummaryDTO(totalIncome, totalExpenses, netBusinessIncome, gstPayable, estimatedTax, potBalance, recentTransactions, insights);
        }
    }

    public static class InsightDTO {
        private Long id;
        private String type;
        private String title;
        private String message;
        private String priority;

        public InsightDTO() {}

        public InsightDTO(Long id, String type, String title, String message, String priority) {
            this.id = id;
            this.type = type;
            this.title = title;
            this.message = message;
            this.priority = priority;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }

        public static InsightDTOBuilder builder() {
            return new InsightDTOBuilder();
        }

        public static class InsightDTOBuilder {
            private Long id;
            private String type;
            private String title;
            private String message;
            private String priority;

            public InsightDTOBuilder id(Long id) { this.id = id; return this; }
            public InsightDTOBuilder type(String type) { this.type = type; return this; }
            public InsightDTOBuilder title(String title) { this.title = title; return this; }
            public InsightDTOBuilder message(String message) { this.message = message; return this; }
            public InsightDTOBuilder priority(String priority) { this.priority = priority; return this; }

            public InsightDTO build() {
                return new InsightDTO(id, type, title, message, priority);
            }
        }
    }
}

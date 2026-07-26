package com.fintax.pro.dto;

import java.math.BigDecimal;
import java.util.List;

public class AnalyticsOverviewDTO {

    private List<TrendDataDTO> trends;
    private List<CategoryShareDTO> categoryBreakdown;
    private List<SplitShareDTO> businessPersonalSplit;
    private SummaryMetricsDTO summary;

    public AnalyticsOverviewDTO() {}

    public AnalyticsOverviewDTO(List<TrendDataDTO> trends, List<CategoryShareDTO> categoryBreakdown, List<SplitShareDTO> businessPersonalSplit, SummaryMetricsDTO summary) {
        this.trends = trends;
        this.categoryBreakdown = categoryBreakdown;
        this.businessPersonalSplit = businessPersonalSplit;
        this.summary = summary;
    }

    // Getters and Setters
    public List<TrendDataDTO> getTrends() { return trends; }
    public void setTrends(List<TrendDataDTO> trends) { this.trends = trends; }

    public List<CategoryShareDTO> getCategoryBreakdown() { return categoryBreakdown; }
    public void setCategoryBreakdown(List<CategoryShareDTO> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; }

    public List<SplitShareDTO> getBusinessPersonalSplit() { return businessPersonalSplit; }
    public void setBusinessPersonalSplit(List<SplitShareDTO> businessPersonalSplit) { this.businessPersonalSplit = businessPersonalSplit; }

    public SummaryMetricsDTO getSummary() { return summary; }
    public void setSummary(SummaryMetricsDTO summary) { this.summary = summary; }

    // Builder
    public static AnalyticsOverviewDTOBuilder builder() {
        return new AnalyticsOverviewDTOBuilder();
    }

    public static class AnalyticsOverviewDTOBuilder {
        private List<TrendDataDTO> trends;
        private List<CategoryShareDTO> categoryBreakdown;
        private List<SplitShareDTO> businessPersonalSplit;
        private SummaryMetricsDTO summary;

        public AnalyticsOverviewDTOBuilder trends(List<TrendDataDTO> trends) { this.trends = trends; return this; }
        public AnalyticsOverviewDTOBuilder categoryBreakdown(List<CategoryShareDTO> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; return this; }
        public AnalyticsOverviewDTOBuilder businessPersonalSplit(List<SplitShareDTO> businessPersonalSplit) { this.businessPersonalSplit = businessPersonalSplit; return this; }
        public AnalyticsOverviewDTOBuilder summary(SummaryMetricsDTO summary) { this.summary = summary; return this; }

        public AnalyticsOverviewDTO build() {
            return new AnalyticsOverviewDTO(trends, categoryBreakdown, businessPersonalSplit, summary);
        }
    }

    public static class TrendDataDTO {
        private String label; // Month/Quarter Name
        private BigDecimal income;
        private BigDecimal expense;

        public TrendDataDTO() {}

        public TrendDataDTO(String label, BigDecimal income, BigDecimal expense) {
            this.label = label;
            this.income = income;
            this.expense = expense;
        }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public BigDecimal getIncome() { return income; }
        public void setIncome(BigDecimal income) { this.income = income; }

        public BigDecimal getExpense() { return expense; }
        public void setExpense(BigDecimal expense) { this.expense = expense; }

        public static TrendDataDTOBuilder builder() {
            return new TrendDataDTOBuilder();
        }

        public static class TrendDataDTOBuilder {
            private String label;
            private BigDecimal income;
            private BigDecimal expense;

            public TrendDataDTOBuilder label(String label) { this.label = label; return this; }
            public TrendDataDTOBuilder income(BigDecimal income) { this.income = income; return this; }
            public TrendDataDTOBuilder expense(BigDecimal expense) { this.expense = expense; return this; }

            public TrendDataDTO build() {
                return new TrendDataDTO(label, income, expense);
            }
        }
    }

    public static class CategoryShareDTO {
        private String category;
        private BigDecimal amount;
        private String type; // INCOME, EXPENSE

        public CategoryShareDTO() {}

        public CategoryShareDTO(String category, BigDecimal amount, String type) {
            this.category = category;
            this.amount = amount;
            this.type = type;
        }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public static CategoryShareDTOBuilder builder() {
            return new CategoryShareDTOBuilder();
        }

        public static class CategoryShareDTOBuilder {
            private String category;
            private BigDecimal amount;
            private String type;

            public CategoryShareDTOBuilder category(String category) { this.category = category; return this; }
            public CategoryShareDTOBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
            public CategoryShareDTOBuilder type(String type) { this.type = type; return this; }

            public CategoryShareDTO build() {
                return new CategoryShareDTO(category, amount, type);
            }
        }
    }

    public static class SplitShareDTO {
        private String tag; // BUSINESS, PERSONAL
        private BigDecimal amount;

        public SplitShareDTO() {}

        public SplitShareDTO(String tag, BigDecimal amount) {
            this.tag = tag;
            this.amount = amount;
        }

        public String getTag() { return tag; }
        public void setTag(String tag) { this.tag = tag; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }

        public static SplitShareDTOBuilder builder() {
            return new SplitShareDTOBuilder();
        }

        public static class SplitShareDTOBuilder {
            private String tag;
            private BigDecimal amount;

            public SplitShareDTOBuilder tag(String tag) { this.tag = tag; return this; }
            public SplitShareDTOBuilder amount(BigDecimal amount) { this.amount = amount; return this; }

            public SplitShareDTO build() {
                return new SplitShareDTO(tag, amount);
            }
        }
    }

    public static class SummaryMetricsDTO {
        private BigDecimal totalIncome;
        private BigDecimal totalExpenses;
        private BigDecimal netEarnings;
        private BigDecimal businessIncome;
        private BigDecimal businessExpenses;
        private BigDecimal businessProfit;

        public SummaryMetricsDTO() {}

        public SummaryMetricsDTO(BigDecimal totalIncome, BigDecimal totalExpenses, BigDecimal netEarnings, BigDecimal businessIncome, BigDecimal businessExpenses, BigDecimal businessProfit) {
            this.totalIncome = totalIncome;
            this.totalExpenses = totalExpenses;
            this.netEarnings = netEarnings;
            this.businessIncome = businessIncome;
            this.businessExpenses = businessExpenses;
            this.businessProfit = businessProfit;
        }

        public BigDecimal getTotalIncome() { return totalIncome; }
        public void setTotalIncome(BigDecimal totalIncome) { this.totalIncome = totalIncome; }

        public BigDecimal getTotalExpenses() { return totalExpenses; }
        public void setTotalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; }

        public BigDecimal getNetEarnings() { return netEarnings; }
        public void setNetEarnings(BigDecimal netEarnings) { this.netEarnings = netEarnings; }

        public BigDecimal getBusinessIncome() { return businessIncome; }
        public void setBusinessIncome(BigDecimal businessIncome) { this.businessIncome = businessIncome; }

        public BigDecimal getBusinessExpenses() { return businessExpenses; }
        public void setBusinessExpenses(BigDecimal businessExpenses) { this.businessExpenses = businessExpenses; }

        public BigDecimal getBusinessProfit() { return businessProfit; }
        public void setBusinessProfit(BigDecimal businessProfit) { this.businessProfit = businessProfit; }

        public static SummaryMetricsDTOBuilder builder() {
            return new SummaryMetricsDTOBuilder();
        }

        public static class SummaryMetricsDTOBuilder {
            private BigDecimal totalIncome;
            private BigDecimal totalExpenses;
            private BigDecimal netEarnings;
            private BigDecimal businessIncome;
            private BigDecimal businessExpenses;
            private BigDecimal businessProfit;

            public SummaryMetricsDTOBuilder totalIncome(BigDecimal totalIncome) { this.totalIncome = totalIncome; return this; }
            public SummaryMetricsDTOBuilder totalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; return this; }
            public SummaryMetricsDTOBuilder netEarnings(BigDecimal netEarnings) { this.netEarnings = netEarnings; return this; }
            public SummaryMetricsDTOBuilder businessIncome(BigDecimal businessIncome) { this.businessIncome = businessIncome; return this; }
            public SummaryMetricsDTOBuilder businessExpenses(BigDecimal businessExpenses) { this.businessExpenses = businessExpenses; return this; }
            public SummaryMetricsDTOBuilder businessProfit(BigDecimal businessProfit) { this.businessProfit = businessProfit; return this; }

            public SummaryMetricsDTO build() {
                return new SummaryMetricsDTO(totalIncome, totalExpenses, netEarnings, businessIncome, businessExpenses, businessProfit);
            }
        }
    }
}

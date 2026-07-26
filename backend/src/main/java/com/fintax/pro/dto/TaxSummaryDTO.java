package com.fintax.pro.dto;

import java.math.BigDecimal;
import java.util.List;

public class TaxSummaryDTO {

    private BigDecimal gstOutput;
    private BigDecimal gstInput;
    private BigDecimal gstPayable;
    private BigDecimal estimatedIncomeTax;
    private BigDecimal advanceTaxEstimate;
    private BigDecimal potBalance;

    private String pan;
    private String aadhaar;
    private String gstin;
    private String businessType;

    private List<DeadlineDTO> upcomingDeadlines;

    public TaxSummaryDTO() {}

    public TaxSummaryDTO(BigDecimal gstOutput, BigDecimal gstInput, BigDecimal gstPayable, BigDecimal estimatedIncomeTax, BigDecimal advanceTaxEstimate, BigDecimal potBalance, String pan, String aadhaar, String gstin, String businessType, List<DeadlineDTO> upcomingDeadlines) {
        this.gstOutput = gstOutput;
        this.gstInput = gstInput;
        this.gstPayable = gstPayable;
        this.estimatedIncomeTax = estimatedIncomeTax;
        this.advanceTaxEstimate = advanceTaxEstimate;
        this.potBalance = potBalance;
        this.pan = pan;
        this.aadhaar = aadhaar;
        this.gstin = gstin;
        this.businessType = businessType;
        this.upcomingDeadlines = upcomingDeadlines;
    }

    // Getters and Setters
    public BigDecimal getGstOutput() { return gstOutput; }
    public void setGstOutput(BigDecimal gstOutput) { this.gstOutput = gstOutput; }

    public BigDecimal getGstInput() { return gstInput; }
    public void setGstInput(BigDecimal gstInput) { this.gstInput = gstInput; }

    public BigDecimal getGstPayable() { return gstPayable; }
    public void setGstPayable(BigDecimal gstPayable) { this.gstPayable = gstPayable; }

    public BigDecimal getEstimatedIncomeTax() { return estimatedIncomeTax; }
    public void setEstimatedIncomeTax(BigDecimal estimatedIncomeTax) { this.estimatedIncomeTax = estimatedIncomeTax; }

    public BigDecimal getAdvanceTaxEstimate() { return advanceTaxEstimate; }
    public void setAdvanceTaxEstimate(BigDecimal advanceTaxEstimate) { this.advanceTaxEstimate = advanceTaxEstimate; }

    public BigDecimal getPotBalance() { return potBalance; }
    public void setPotBalance(BigDecimal potBalance) { this.potBalance = potBalance; }

    public String getPan() { return pan; }
    public void setPan(String pan) { this.pan = pan; }

    public String getAadhaar() { return aadhaar; }
    public void setAadhaar(String aadhaar) { this.aadhaar = aadhaar; }

    public String getGstin() { return gstin; }
    public void setGstin(String gstin) { this.gstin = gstin; }

    public String getBusinessType() { return businessType; }
    public void setBusinessType(String businessType) { this.businessType = businessType; }

    public List<DeadlineDTO> getUpcomingDeadlines() { return upcomingDeadlines; }
    public void setUpcomingDeadlines(List<DeadlineDTO> upcomingDeadlines) { this.upcomingDeadlines = upcomingDeadlines; }

    // Builder
    public static TaxSummaryDTOBuilder builder() {
        return new TaxSummaryDTOBuilder();
    }

    public static class TaxSummaryDTOBuilder {
        private BigDecimal gstOutput;
        private BigDecimal gstInput;
        private BigDecimal gstPayable;
        private BigDecimal estimatedIncomeTax;
        private BigDecimal advanceTaxEstimate;
        private BigDecimal potBalance;
        private String pan;
        private String aadhaar;
        private String gstin;
        private String businessType;
        private List<DeadlineDTO> upcomingDeadlines;

        public TaxSummaryDTOBuilder gstOutput(BigDecimal gstOutput) { this.gstOutput = gstOutput; return this; }
        public TaxSummaryDTOBuilder gstInput(BigDecimal gstInput) { this.gstInput = gstInput; return this; }
        public TaxSummaryDTOBuilder gstPayable(BigDecimal gstPayable) { this.gstPayable = gstPayable; return this; }
        public TaxSummaryDTOBuilder estimatedIncomeTax(BigDecimal estimatedIncomeTax) { this.estimatedIncomeTax = estimatedIncomeTax; return this; }
        public TaxSummaryDTOBuilder advanceTaxEstimate(BigDecimal advanceTaxEstimate) { this.advanceTaxEstimate = advanceTaxEstimate; return this; }
        public TaxSummaryDTOBuilder potBalance(BigDecimal potBalance) { this.potBalance = potBalance; return this; }
        public TaxSummaryDTOBuilder pan(String pan) { this.pan = pan; return this; }
        public TaxSummaryDTOBuilder aadhaar(String aadhaar) { this.aadhaar = aadhaar; return this; }
        public TaxSummaryDTOBuilder gstin(String gstin) { this.gstin = gstin; return this; }
        public TaxSummaryDTOBuilder businessType(String businessType) { this.businessType = businessType; return this; }
        public TaxSummaryDTOBuilder upcomingDeadlines(List<DeadlineDTO> upcomingDeadlines) { this.upcomingDeadlines = upcomingDeadlines; return this; }

        public TaxSummaryDTO build() {
            return new TaxSummaryDTO(gstOutput, gstInput, gstPayable, estimatedIncomeTax, advanceTaxEstimate, potBalance, pan, aadhaar, gstin, businessType, upcomingDeadlines);
        }
    }

    public static class DeadlineDTO {
        private String title;
        private String dueDate;
        private String status; // PENDING, OVERDUE, FILED
        private String obligationType; // GST, ADVANCE_TAX, INCOME_TAX

        public DeadlineDTO() {}

        public DeadlineDTO(String title, String dueDate, String status, String obligationType) {
            this.title = title;
            this.dueDate = dueDate;
            this.status = status;
            this.obligationType = obligationType;
        }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDueDate() { return dueDate; }
        public void setDueDate(String dueDate) { this.dueDate = dueDate; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getObligationType() { return obligationType; }
        public void setObligationType(String obligationType) { this.obligationType = obligationType; }

        public static DeadlineDTOBuilder builder() {
            return new DeadlineDTOBuilder();
        }

        public static class DeadlineDTOBuilder {
            private String title;
            private String dueDate;
            private String status;
            private String obligationType;

            public DeadlineDTOBuilder title(String title) { this.title = title; return this; }
            public DeadlineDTOBuilder dueDate(String dueDate) { this.dueDate = dueDate; return this; }
            public DeadlineDTOBuilder status(String status) { this.status = status; return this; }
            public DeadlineDTOBuilder obligationType(String obligationType) { this.obligationType = obligationType; return this; }

            public DeadlineDTO build() {
                return new DeadlineDTO(title, dueDate, status, obligationType);
            }
        }
    }
}

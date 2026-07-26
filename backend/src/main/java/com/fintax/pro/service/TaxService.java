package com.fintax.pro.service;

import com.fintax.pro.dto.TaxSummaryDTO;
import com.fintax.pro.entity.Profile;
import com.fintax.pro.entity.Transaction;
import com.fintax.pro.entity.User;
import com.fintax.pro.repository.ProfileRepository;
import com.fintax.pro.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class TaxService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private PotService potService;

    public TaxSummaryDTO getTaxSummary(User user) {
        Profile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        List<Transaction> transactions = transactionRepository.findByUser(user, Sort.by(Sort.Direction.ASC, "date"));

        BigDecimal gstOutput = BigDecimal.ZERO;
        BigDecimal gstInput = BigDecimal.ZERO;
        BigDecimal grossReceipts = BigDecimal.ZERO;
        BigDecimal totalBusinessExpenses = BigDecimal.ZERO;

        for (Transaction t : transactions) {
            if (t.getIsBusiness()) {
                BigDecimal amount = t.getAmount();
                BigDecimal rate = t.getGstRate().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);

                // GST calculations
                if ("INCOME".equalsIgnoreCase(t.getType())) {
                    grossReceipts = grossReceipts.add(amount);
                    // GST Output = (amount * rate) / (1 + rate) if GST was inclusive, or simply
                    // amount * rate if exclusive.
                    // Let's assume input amount is inclusive of GST.
                    // Formula: inclusive_gst = amount - (amount / (1 + rate))
                    BigDecimal baseVal = amount.divide(BigDecimal.ONE.add(rate), 2, RoundingMode.HALF_UP);
                    BigDecimal gstVal = amount.subtract(baseVal);
                    gstOutput = gstOutput.add(gstVal);
                } else if ("EXPENSE".equalsIgnoreCase(t.getType())) {
                    totalBusinessExpenses = totalBusinessExpenses.add(amount);
                    // GST Input Credit eligibility
                    BigDecimal baseVal = amount.divide(BigDecimal.ONE.add(rate), 2, RoundingMode.HALF_UP);
                    BigDecimal gstVal = amount.subtract(baseVal);
                    gstInput = gstInput.add(gstVal);
                }
            }
        }

        BigDecimal gstPayable = gstOutput.subtract(gstInput);
        if (gstPayable.compareTo(BigDecimal.ZERO) < 0) {
            gstPayable = BigDecimal.ZERO;
        }

        // Income Tax slab estimates
        // Freelancers in India standard: Presumptive Taxation Section 44ADA.
        // Taxable Profit is 50% of Gross Receipts.
        BigDecimal presumptiveIncome = grossReceipts.multiply(new BigDecimal("0.50"));

        // Regular Taxation: Gross Receipts - Business Expenses
        BigDecimal regularIncome = grossReceipts.subtract(totalBusinessExpenses);
        if (regularIncome.compareTo(BigDecimal.ZERO) < 0) {
            regularIncome = BigDecimal.ZERO;
        }

        // We choose whichever is lower/better for the user as the estimated taxable
        // income,
        // provided they are eligible for presumptive taxation under Section 44ADA
        // (gross receipts <= ₹75 Lakhs).
        BigDecimal taxableIncome;
        BigDecimal limit44ADA = new BigDecimal("7500000.00");
        if (grossReceipts.compareTo(limit44ADA) <= 0) {
            taxableIncome = presumptiveIncome.compareTo(regularIncome) < 0 ? presumptiveIncome : regularIncome;
        } else {
            taxableIncome = regularIncome;
        }

        // Standard New Slab calculations for FY 2025-26 (Indian New Tax Regime):
        // Up to 4,00,000: 0%
        // 4,00,001 - 8,00,000: 5%
        // 8,00,001 - 12,00,000: 10%
        // 12,00,001 - 16,00,000: 15%
        // 16,00,001 - 20,00,000: 20%
        // 20,00,001 - 24,00,000: 25%
        // Above 24,00,000: 30%
        // Rebate under Section 87A: If total taxable income is <= ₹12,00,000, tax is
        // fully rebated (0 tax liability).

        BigDecimal incomeTaxEstimate = calculateNewRegimeTax(taxableIncome);

        // Advance tax calculation: If income tax liability is >= 10,000, pay advance
        // tax
        BigDecimal advanceTaxEstimate = BigDecimal.ZERO;
        if (incomeTaxEstimate.compareTo(new BigDecimal("10000.00")) >= 0) {
            advanceTaxEstimate = incomeTaxEstimate;
        }

        // Prepare upcoming deadlines
        List<TaxSummaryDTO.DeadlineDTO> deadlines = getDeadlines();

        BigDecimal potBalance = potService.getPotBalance(user);

        return TaxSummaryDTO.builder()
                .gstOutput(gstOutput.setScale(2, RoundingMode.HALF_UP))
                .gstInput(gstInput.setScale(2, RoundingMode.HALF_UP))
                .gstPayable(gstPayable.setScale(2, RoundingMode.HALF_UP))
                .estimatedIncomeTax(incomeTaxEstimate.setScale(2, RoundingMode.HALF_UP))
                .advanceTaxEstimate(advanceTaxEstimate.setScale(2, RoundingMode.HALF_UP))
                .potBalance(potBalance.setScale(2, RoundingMode.HALF_UP))
                .pan(profile.getPan())
                .aadhaar(profile.getAadhaar())
                .gstin(profile.getGstin())
                .businessType(profile.getBusinessType())
                .upcomingDeadlines(deadlines)
                .build();
    }

    private BigDecimal calculateNewRegimeTax(BigDecimal income) {
        if (income.compareTo(new BigDecimal("1200000.00")) <= 0) {
            return BigDecimal.ZERO; // Under Section 87A rebate for FY 2025-26
        }

        BigDecimal tax = BigDecimal.ZERO;
        double inc = income.doubleValue();

        // Standard Slabs for FY 2025-26 (New Regime):
        // Up to 4,00,000: NIL
        // 4,00,001 - 8,00,000: 5%
        // 8,00,001 - 12,00,000: 10%
        // 12,00,001 - 16,00,000: 15%
        // 16,00,001 - 20,00,000: 20%
        // 20,00,001 - 24,00,000: 25%
        // Above 24,00,000: 30%

        if (inc > 2400000) {
            tax = tax.add(new BigDecimal((inc - 2400000) * 0.30));
            inc = 2400000;
        }
        if (inc > 2000000) {
            tax = tax.add(new BigDecimal((inc - 2000000) * 0.25));
            inc = 2000000;
        }
        if (inc > 1600000) {
            tax = tax.add(new BigDecimal((inc - 1600000) * 0.20));
            inc = 1600000;
        }
        if (inc > 1200000) {
            tax = tax.add(new BigDecimal((inc - 1200000) * 0.15));
            inc = 1200000;
        }
        if (inc > 800000) {
            tax = tax.add(new BigDecimal((inc - 800000) * 0.10));
            inc = 800000;
        }
        if (inc > 400000) {
            tax = tax.add(new BigDecimal((inc - 400000) * 0.05));
        }

        // Apply Section 87A Marginal Relief:
        // Capped at the excess of income over ₹12 Lakhs before cess is applied
        BigDecimal excessIncome = income.subtract(new BigDecimal("1200000.00"));
        if (tax.compareTo(excessIncome) > 0) {
            tax = excessIncome;
        }

        // Add 4% Health and Education Cess
        tax = tax.multiply(new BigDecimal("1.04"));

        return tax;
    }

    private List<TaxSummaryDTO.DeadlineDTO> getDeadlines() {
        List<TaxSummaryDTO.DeadlineDTO> list = new ArrayList<>();
        LocalDate now = LocalDate.now();
        int year = now.getYear();

        // Standard Indian GST quarterly return deadline (QRMP)
        list.add(TaxSummaryDTO.DeadlineDTO.builder()
                .title("GSTR-1 & GSTR-3B (Quarterly)")
                .dueDate("July 24, " + year)
                .obligationType("GST")
                .status(now.isAfter(LocalDate.of(year, 7, 24)) ? "FILED" : "PENDING")
                .build());

        // Advance tax deadlines: June 15, Sep 15, Dec 15, March 15
        list.add(TaxSummaryDTO.DeadlineDTO.builder()
                .title("Advance Tax Installment (15%)")
                .dueDate("June 15, " + year)
                .obligationType("ADVANCE_TAX")
                .status(now.isAfter(LocalDate.of(year, 6, 15)) ? "FILED" : "PENDING")
                .build());

        list.add(TaxSummaryDTO.DeadlineDTO.builder()
                .title("Advance Tax Installment (45%)")
                .dueDate("September 15, " + year)
                .obligationType("ADVANCE_TAX")
                .status(now.isAfter(LocalDate.of(year, 9, 15)) ? "FILED" : "PENDING")
                .build());

        list.add(TaxSummaryDTO.DeadlineDTO.builder()
                .title("Advance Tax Installment (75%)")
                .dueDate("December 15, " + year)
                .obligationType("ADVANCE_TAX")
                .status(now.isAfter(LocalDate.of(year, 12, 15)) ? "FILED" : "PENDING")
                .build());

        list.add(TaxSummaryDTO.DeadlineDTO.builder()
                .title("Advance Tax Installment (100%)")
                .dueDate("March 15, " + (year + (now.getMonthValue() > 3 ? 1 : 0)))
                .obligationType("ADVANCE_TAX")
                .status("PENDING")
                .build());

        // Income Tax return filing for individuals/freelancers: July 31
        list.add(TaxSummaryDTO.DeadlineDTO.builder()
                .title("Income Tax Return Filing (ITR-4)")
                .dueDate("July 31, " + year)
                .obligationType("INCOME_TAX")
                .status(now.isAfter(LocalDate.of(year, 7, 31)) ? "OVERDUE" : "PENDING")
                .build());

        return list;
    }
}

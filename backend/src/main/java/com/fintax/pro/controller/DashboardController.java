package com.fintax.pro.controller;

import com.fintax.pro.dto.DashboardSummaryDTO;
import com.fintax.pro.dto.TaxSummaryDTO;
import com.fintax.pro.dto.TransactionDTO;
import com.fintax.pro.entity.User;
import com.fintax.pro.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/summary")
public class DashboardController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private TaxService taxService;

    @Autowired
    private PotService potService;

    @Autowired
    private InsightService insightService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.getUserByEmail(email);

        // Fetch all transactions
        List<TransactionDTO> allTransactions = transactionService.getAllTransactions(user);

        // Calculate overall income & expenses
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;
        for (TransactionDTO t : allTransactions) {
            if ("INCOME".equalsIgnoreCase(t.getType())) {
                totalIncome = totalIncome.add(t.getAmount());
            } else {
                totalExpenses = totalExpenses.add(t.getAmount());
            }
        }

        // Fetch tax engine statistics
        TaxSummaryDTO taxSummary = taxService.getTaxSummary(user);

        // Fetch recent transactions (top 5)
        List<TransactionDTO> recentTransactions = allTransactions.stream()
                .limit(5)
                .collect(Collectors.toList());

        // Fetch smart insights
        List<DashboardSummaryDTO.InsightDTO> insights = insightService.getTop3Insights(user);

        // Pot balance
        BigDecimal potBalance = potService.getPotBalance(user);

        DashboardSummaryDTO summary = DashboardSummaryDTO.builder()
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netBusinessIncome(taxSummary.getGstOutput().multiply(new BigDecimal("5.55"))) // Fallback logic or just calculated from regular/presumptive taxable profit
                .gstPayable(taxSummary.getGstPayable())
                .estimatedTax(taxSummary.getEstimatedIncomeTax())
                .potBalance(potBalance)
                .recentTransactions(recentTransactions)
                .insights(insights)
                .build();

        // Calculate actual net business profit instead of mock factor
        BigDecimal netBusinessIncome = BigDecimal.ZERO;
        BigDecimal businessIncome = BigDecimal.ZERO;
        BigDecimal businessExpenses = BigDecimal.ZERO;
        for (TransactionDTO t : allTransactions) {
            if (t.getIsBusiness()) {
                if ("INCOME".equalsIgnoreCase(t.getType())) {
                    businessIncome = businessIncome.add(t.getAmount());
                } else {
                    businessExpenses = businessExpenses.add(t.getAmount());
                }
            }
        }
        netBusinessIncome = businessIncome.subtract(businessExpenses);
        summary.setNetBusinessIncome(netBusinessIncome);

        return ResponseEntity.ok(summary);
    }
}

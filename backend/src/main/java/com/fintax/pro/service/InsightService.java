package com.fintax.pro.service;

import com.fintax.pro.dto.DashboardSummaryDTO.InsightDTO;
import com.fintax.pro.entity.Insight;
import com.fintax.pro.entity.Transaction;
import com.fintax.pro.entity.User;
import com.fintax.pro.repository.InsightRepository;
import com.fintax.pro.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InsightService {

    @Autowired
    private InsightRepository insightRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private PotService potService;

    @Transactional
    public List<InsightDTO> getTop3Insights(User user) {
        // Regenerate insights based on current data
        regenerateInsights(user);

        // Fetch top 3 by priority & date
        List<Insight> list = insightRepository.findByUser(user, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        // Define priority weightings: HIGH = 3, MEDIUM = 2, LOW = 1
        Comparator<Insight> priorityComparator = (i1, i2) -> {
            int w1 = getWeight(i1.getPriority());
            int w2 = getWeight(i2.getPriority());
            return Integer.compare(w2, w1); // descending weight
        };

        return list.stream()
                .sorted(priorityComparator)
                .limit(3)
                .map(i -> InsightDTO.builder()
                        .id(i.getId())
                        .type(i.getType())
                        .title(i.getTitle())
                        .message(i.getMessage())
                        .priority(i.getPriority())
                        .build())
                .collect(Collectors.toList());
    }

    private int getWeight(String priority) {
        if ("HIGH".equalsIgnoreCase(priority)) return 3;
        if ("MEDIUM".equalsIgnoreCase(priority)) return 2;
        return 1;
    }

    @Transactional
    public void regenerateInsights(User user) {
        // Clear previous insights for a fresh evaluation
        insightRepository.deleteByUser(user);

        List<Insight> newInsights = new ArrayList<>();
        List<Transaction> transactions = transactionRepository.findByUser(user, Sort.by(Sort.Direction.ASC, "date"));

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        BigDecimal gstPayable = BigDecimal.ZERO;
        int personalExpenseCount = 0;
        int totalExpenseCount = 0;

        for (Transaction t : transactions) {
            if ("INCOME".equalsIgnoreCase(t.getType())) {
                totalIncome = totalIncome.add(t.getAmount());
                if (t.getIsBusiness() && t.getGstRate() != null) {
                    // Quick rough calculation for GST Output
                    BigDecimal rate = t.getGstRate().divide(new BigDecimal("100"));
                    BigDecimal base = t.getAmount().divide(BigDecimal.ONE.add(rate), 2, RoundingMode.HALF_UP);
                    gstPayable = gstPayable.add(t.getAmount().subtract(base));
                }
            } else {
                totalExpense = totalExpense.add(t.getAmount());
                totalExpenseCount++;
                if ("PERSONAL".equalsIgnoreCase(t.getTag())) {
                    personalExpenseCount++;
                }
            }
        }

        // Rule 1: High GST Payable Insight
        if (gstPayable.compareTo(new BigDecimal("15000.00")) > 0) {
            newInsights.add(Insight.builder()
                    .user(user)
                    .type("GST")
                    .title("High GST Liability Warning")
                    .message("Your calculated GST payable this quarter has crossed ₹15,000. Ensure you file GSTR-3B on time to avoid interest charges under Section 50.")
                    .priority("HIGH")
                    .build());
        }

        // Rule 2: Personal expense classification suggestions
        if (totalExpenseCount > 0 && ((double) personalExpenseCount / totalExpenseCount) > 0.40) {
            newInsights.add(Insight.builder()
                    .user(user)
                    .type("TAX")
                    .title("Untagged Expenses Opportunity")
                    .message("Over 40% of your expenses are classified as Personal. Review them in the Transactions view to confirm if some (e.g. workspace rent, internet) qualify for business deductions.")
                    .priority("MEDIUM")
                    .build());
        }

        // Rule 3: Income Smoother Suggestion
        BigDecimal potBal = potService.getPotBalance(user);
        BigDecimal surplus = totalIncome.subtract(totalExpense);
        if (surplus.compareTo(BigDecimal.ZERO) > 0 && potBal.compareTo(surplus.multiply(new BigDecimal("0.10"))) < 0) {
            newInsights.add(Insight.builder()
                    .user(user)
                    .type("POT")
                    .title("Low Reserve Pot Balance")
                    .message("Your Income Smoother balance is low. Consider allocating 10% of your recent project earnings (approx. ₹" + surplus.multiply(new BigDecimal("0.1")).intValue() + ") to handle dry spells.")
                    .priority("MEDIUM")
                    .build());
        }

        // Rule 4: Tax deadlines
        LocalDate now = LocalDate.now();
        int month = now.getMonthValue();
        if (month == 3 || month == 6 || month == 9 || month == 12) {
            newInsights.add(Insight.builder()
                    .user(user)
                    .type("GENERAL")
                    .title("Quarterly Tax Deadline Approaching")
                    .message("The quarter-end tax obligations are approaching. Check your GST outputs and review your Advance Tax installment timeline in the Tax Vault.")
                    .priority("HIGH")
                    .build());
        } else {
            newInsights.add(Insight.builder()
                    .user(user)
                    .type("GENERAL")
                    .title("Filing Documentation Check")
                    .message("Keep invoices, bank statements, and UPI receipts stored. Use our Export Center to generate clean spreadsheets for your CA before tax season peaks.")
                    .priority("LOW")
                    .build());
        }

        insightRepository.saveAll(newInsights);
    }
}

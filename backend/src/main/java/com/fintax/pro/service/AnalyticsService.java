package com.fintax.pro.service;

import com.fintax.pro.dto.AnalyticsOverviewDTO;
import com.fintax.pro.entity.Transaction;
import com.fintax.pro.entity.User;
import com.fintax.pro.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private TransactionRepository transactionRepository;

    public AnalyticsOverviewDTO getAnalyticsOverview(User user, String period) {
        LocalDate now = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate = now;

        // Parse period filter
        if ("month".equalsIgnoreCase(period)) {
            startDate = now.withDayOfMonth(1);
        } else if ("quarter".equalsIgnoreCase(period)) {
            int currentMonth = now.getMonthValue();
            int startMonth = ((currentMonth - 1) / 3) * 3 + 1;
            startDate = LocalDate.of(now.getYear(), startMonth, 1);
        } else { // default to "year" (financial year starting April 1st)
            int year = now.getYear();
            if (now.getMonthValue() < 4) {
                year = year - 1;
            }
            startDate = LocalDate.of(year, 4, 1);
        }

        List<Transaction> transactions = transactionRepository.findByUserAndDateBetween(
                user, startDate, endDate, Sort.by(Sort.Direction.ASC, "date"));

        // 1. Calculate Summary Metrics
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;
        BigDecimal businessIncome = BigDecimal.ZERO;
        BigDecimal businessExpenses = BigDecimal.ZERO;

        for (Transaction t : transactions) {
            BigDecimal amount = t.getAmount();
            if ("INCOME".equalsIgnoreCase(t.getType())) {
                totalIncome = totalIncome.add(amount);
                if (t.getIsBusiness()) {
                    businessIncome = businessIncome.add(amount);
                }
            } else if ("EXPENSE".equalsIgnoreCase(t.getType())) {
                totalExpenses = totalExpenses.add(amount);
                if (t.getIsBusiness()) {
                    businessExpenses = businessExpenses.add(amount);
                }
            }
        }

        BigDecimal netEarnings = totalIncome.subtract(totalExpenses);
        BigDecimal businessProfit = businessIncome.subtract(businessExpenses);

        AnalyticsOverviewDTO.SummaryMetricsDTO summary = AnalyticsOverviewDTO.SummaryMetricsDTO.builder()
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netEarnings(netEarnings)
                .businessIncome(businessIncome)
                .businessExpenses(businessExpenses)
                .businessProfit(businessProfit)
                .build();

        // 2. Trend chart calculations (Grouped by Month)
        Map<String, Map<String, BigDecimal>> trendMap = new LinkedHashMap<>();
        // Pre-fill trend keys for chronological sorting
        LocalDate temp = startDate;
        while (!temp.isAfter(endDate)) {
            String monthName = temp.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + (temp.getYear() % 100);
            trendMap.put(monthName, new HashMap<>());
            trendMap.get(monthName).put("INCOME", BigDecimal.ZERO);
            trendMap.get(monthName).put("EXPENSE", BigDecimal.ZERO);
            temp = temp.plusMonths(1);
        }

        for (Transaction t : transactions) {
            String monthName = t.getDate().getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + (t.getDate().getYear() % 100);
            trendMap.putIfAbsent(monthName, new HashMap<>());
            Map<String, BigDecimal> map = trendMap.get(monthName);
            map.put("INCOME", map.getOrDefault("INCOME", BigDecimal.ZERO));
            map.put("EXPENSE", map.getOrDefault("EXPENSE", BigDecimal.ZERO));

            String type = t.getType().toUpperCase();
            if (map.containsKey(type)) {
                map.put(type, map.get(type).add(t.getAmount()));
            }
        }

        List<AnalyticsOverviewDTO.TrendDataDTO> trends = trendMap.entrySet().stream()
                .map(e -> AnalyticsOverviewDTO.TrendDataDTO.builder()
                        .label(e.getKey())
                        .income(e.getValue().get("INCOME"))
                        .expense(e.getValue().get("EXPENSE"))
                        .build())
                .collect(Collectors.toList());

        // 3. Category Breakdown (Share of expenses by category)
        Map<String, BigDecimal> categoryMap = new HashMap<>();
        for (Transaction t : transactions) {
            categoryMap.put(t.getCategory(), categoryMap.getOrDefault(t.getCategory(), BigDecimal.ZERO).add(t.getAmount()));
        }

        List<AnalyticsOverviewDTO.CategoryShareDTO> categoryBreakdown = categoryMap.entrySet().stream()
                .map(e -> {
                    // Match transaction type by looking up any transaction with this category
                    String type = transactions.stream()
                            .filter(t -> t.getCategory().equals(e.getKey()))
                            .map(Transaction::getType)
                            .findFirst()
                            .orElse("EXPENSE");
                    return AnalyticsOverviewDTO.CategoryShareDTO.builder()
                            .category(e.getKey())
                            .amount(e.getValue())
                            .type(type)
                            .build();
                })
                .collect(Collectors.toList());

        // 4. Business vs Personal split
        Map<String, BigDecimal> splitMap = new HashMap<>();
        splitMap.put("BUSINESS", BigDecimal.ZERO);
        splitMap.put("PERSONAL", BigDecimal.ZERO);

        for (Transaction t : transactions) {
            String tag = t.getTag().toUpperCase();
            splitMap.put(tag, splitMap.getOrDefault(tag, BigDecimal.ZERO).add(t.getAmount()));
        }

        List<AnalyticsOverviewDTO.SplitShareDTO> businessPersonalSplit = splitMap.entrySet().stream()
                .map(e -> AnalyticsOverviewDTO.SplitShareDTO.builder()
                        .tag(e.getKey())
                        .amount(e.getValue())
                        .build())
                .collect(Collectors.toList());

        return AnalyticsOverviewDTO.builder()
                .trends(trends)
                .categoryBreakdown(categoryBreakdown)
                .businessPersonalSplit(businessPersonalSplit)
                .summary(summary)
                .build();
    }
}

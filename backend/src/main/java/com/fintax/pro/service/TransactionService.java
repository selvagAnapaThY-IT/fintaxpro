package com.fintax.pro.service;

import com.fintax.pro.dto.TransactionDTO;
import com.fintax.pro.entity.Transaction;
import com.fintax.pro.entity.User;
import com.fintax.pro.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    public List<TransactionDTO> getAllTransactions(User user) {
        return transactionRepository.findByUser(user, Sort.by(Sort.Direction.DESC, "date"))
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<TransactionDTO> filterTransactions(
            User user, String type, String tag, String source,
            LocalDate startDate, LocalDate endDate, String search) {
        
        String searchVal = (search == null || search.trim().isEmpty()) ? "" : search.trim();
        List<Transaction> transactions = transactionRepository.filterTransactions(
                user,
                (type != null && !type.isEmpty()) ? type : null,
                (tag != null && !tag.isEmpty()) ? tag : null,
                (source != null && !source.isEmpty()) ? source : null,
                startDate,
                endDate,
                searchVal,
                Sort.by(Sort.Direction.DESC, "date")
        );

        return transactions.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TransactionDTO createTransaction(User user, TransactionDTO dto) {
        Transaction transaction = mapToEntity(dto);
        transaction.setUser(user);

        // Apply Smart Auto-tagging Rules if tagging details are missing or empty
        applySmartTagging(transaction);

        transaction = transactionRepository.save(transaction);
        return mapToDTO(transaction);
    }

    @Transactional
    public TransactionDTO updateTransaction(User user, Long id, TransactionDTO dto) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to transaction");
        }

        transaction.setType(dto.getType());
        transaction.setAmount(dto.getAmount());
        transaction.setDescription(dto.getDescription());
        transaction.setCategory(dto.getCategory());
        transaction.setSource(dto.getSource());
        transaction.setDate(dto.getDate());
        
        // Let user manual override tag and GST rate
        transaction.setTag(dto.getTag());
        transaction.setIsBusiness("BUSINESS".equalsIgnoreCase(dto.getTag()));
        transaction.setGstRate(dto.getGstRate() != null ? dto.getGstRate() : BigDecimal.ZERO);

        transaction = transactionRepository.save(transaction);
        return mapToDTO(transaction);
    }

    @Transactional
    public void deleteTransaction(User user, Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to transaction");
        }

        transactionRepository.delete(transaction);
    }

    private void applySmartTagging(Transaction transaction) {
        // Core rule engine for freelancers:
        String desc = transaction.getDescription().toLowerCase();
        String cat = transaction.getCategory().toLowerCase();

        // 1. Business rules: Typical freelance incomes or work expense tools
        List<String> businessTriggers = Arrays.asList(
                "consulting", "freelance", "salary", "client", "payout", "invoice", "payment from",
                "saas", "hosting", "aws", "gcp", "github", "copilot", "software", "office", "rent", 
                "internet", "broadband", "coworking", "travel", "zoom", "miro", "domain", "marketing", "ads"
        );

        // 2. Personal rules: Lifestyle & general consumption
        List<String> personalTriggers = Arrays.asList(
                "grocery", "supermarket", "dining", "swiggy", "zomato", "movie", "netflix", "spotify",
                "gym", "fitness", "clothing", "apparel", "gift", "personal", "uber", "ola", "cab", "shopping"
        );

        boolean matchesBusiness = businessTriggers.stream().anyMatch(t -> desc.contains(t) || cat.contains(t));
        boolean matchesPersonal = personalTriggers.stream().anyMatch(t -> desc.contains(t) || cat.contains(t));

        // Default or user specified override
        if (transaction.getTag() == null || transaction.getTag().isEmpty()) {
            if (matchesBusiness && !matchesPersonal) {
                transaction.setTag("BUSINESS");
                transaction.setIsBusiness(true);
            } else if (matchesPersonal && !matchesBusiness) {
                transaction.setTag("PERSONAL");
                transaction.setIsBusiness(false);
            } else {
                // If it is income, default to business for freelancers. If expense, default to personal.
                if ("INCOME".equalsIgnoreCase(transaction.getType())) {
                    transaction.setTag("BUSINESS");
                    transaction.setIsBusiness(true);
                } else {
                    transaction.setTag("PERSONAL");
                    transaction.setIsBusiness(false);
                }
            }
        } else {
            transaction.setIsBusiness("BUSINESS".equalsIgnoreCase(transaction.getTag()));
        }

        // Apply GST rate defaults (Indian standard 18% for freelance/IT services/consulting/SaaS)
        if (transaction.getGstRate() == null) {
            if (transaction.getIsBusiness()) {
                // Freelancers standard GST is 18% on services
                transaction.setGstRate(new BigDecimal("18.00"));
            } else {
                transaction.setGstRate(BigDecimal.ZERO);
            }
        }
    }

    public TransactionDTO mapToDTO(Transaction t) {
        return TransactionDTO.builder()
                .id(t.getId())
                .type(t.getType())
                .amount(t.getAmount())
                .description(t.getDescription())
                .category(t.getCategory())
                .source(t.getSource())
                .tag(t.getTag())
                .isBusiness(t.getIsBusiness())
                .gstRate(t.getGstRate())
                .date(t.getDate())
                .build();
    }

    private Transaction mapToEntity(TransactionDTO dto) {
        return Transaction.builder()
                .id(dto.getId())
                .type(dto.getType())
                .amount(dto.getAmount())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .source(dto.getSource())
                .tag(dto.getTag())
                .isBusiness(dto.getIsBusiness() != null ? dto.getIsBusiness() : false)
                .gstRate(dto.getGstRate())
                .date(dto.getDate())
                .build();
    }
}

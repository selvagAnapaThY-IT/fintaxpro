package com.fintax.pro.service;

import com.fintax.pro.entity.PotTransaction;
import com.fintax.pro.entity.User;
import com.fintax.pro.repository.PotTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class PotService {

    @Autowired
    private PotTransactionRepository potTransactionRepository;

    public BigDecimal getPotBalance(User user) {
        List<PotTransaction> txs = potTransactionRepository.findByUser(user, Sort.by(Sort.Direction.ASC, "createdAt"));
        BigDecimal balance = BigDecimal.ZERO;
        for (PotTransaction tx : txs) {
            if ("DEPOSIT".equalsIgnoreCase(tx.getType())) {
                balance = balance.add(tx.getAmount());
            } else if ("WITHDRAW".equalsIgnoreCase(tx.getType())) {
                balance = balance.subtract(tx.getAmount());
            }
        }
        return balance;
    }

    public List<PotTransaction> getPotHistory(User user) {
        return potTransactionRepository.findByUser(user, Sort.by(Sort.Direction.DESC, "date"));
    }

    @Transactional
    public PotTransaction simulateTransaction(User user, String type, BigDecimal amount, String description) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Amount must be greater than zero");
        }

        if ("WITHDRAW".equalsIgnoreCase(type)) {
            BigDecimal currentBal = getPotBalance(user);
            if (currentBal.compareTo(amount) < 0) {
                throw new RuntimeException("Insufficient balance in Income Smoother Pot");
            }
        }

        PotTransaction tx = PotTransaction.builder()
                .user(user)
                .type(type.toUpperCase())
                .amount(amount)
                .description(description)
                .date(LocalDate.now())
                .build();

        return potTransactionRepository.save(tx);
    }
}

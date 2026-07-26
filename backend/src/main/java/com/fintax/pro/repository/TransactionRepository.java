package com.fintax.pro.repository;

import com.fintax.pro.entity.Transaction;
import com.fintax.pro.entity.User;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser(User user, Sort sort);

    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND " +
           "(:type IS NULL OR t.type = :type) AND " +
           "(:tag IS NULL OR t.tag = :tag) AND " +
           "(:source IS NULL OR t.source = :source) AND " +
           "(:startDate IS NULL OR t.date >= :startDate) AND " +
           "(:endDate IS NULL OR t.date <= :endDate) AND " +
           "(LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.category) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Transaction> filterTransactions(
            @Param("user") User user,
            @Param("type") String type,
            @Param("tag") String tag,
            @Param("source") String source,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("search") String search,
            Sort sort
    );

    List<Transaction> findByUserAndDateBetween(User user, LocalDate start, LocalDate end, Sort sort);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.type = 'INCOME' AND t.isBusiness = true")
    double sumBusinessIncome(@Param("user") User user);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.type = 'EXPENSE' AND t.isBusiness = true")
    double sumBusinessExpenses(@Param("user") User user);
}

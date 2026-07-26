package com.fintax.pro.repository;

import com.fintax.pro.entity.PotTransaction;
import com.fintax.pro.entity.User;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PotTransactionRepository extends JpaRepository<PotTransaction, Long> {
    List<PotTransaction> findByUser(User user, Sort sort);
}

package com.fintax.pro.repository;

import com.fintax.pro.entity.TaxSnapshot;
import com.fintax.pro.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaxSnapshotRepository extends JpaRepository<TaxSnapshot, Long> {
    List<TaxSnapshot> findByUser(User user);
    Optional<TaxSnapshot> findByUserAndPeriod(User user, String period);
}

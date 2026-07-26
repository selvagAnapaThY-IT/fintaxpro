package com.fintax.pro.repository;

import com.fintax.pro.entity.Insight;
import com.fintax.pro.entity.User;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InsightRepository extends JpaRepository<Insight, Long> {
    List<Insight> findByUser(User user, Sort sort);
    void deleteByUser(User user);
}

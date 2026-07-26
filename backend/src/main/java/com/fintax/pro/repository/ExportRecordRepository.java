package com.fintax.pro.repository;

import com.fintax.pro.entity.ExportRecord;
import com.fintax.pro.entity.User;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExportRecordRepository extends JpaRepository<ExportRecord, Long> {
    List<ExportRecord> findByUser(User user, Sort sort);
}

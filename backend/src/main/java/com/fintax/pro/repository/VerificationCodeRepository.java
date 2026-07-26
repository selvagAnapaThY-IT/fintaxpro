package com.fintax.pro.repository;

import com.fintax.pro.entity.VerificationCode;
import com.fintax.pro.entity.VerificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {

    Optional<VerificationCode> findTopByEmailAndTypeAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
            String email, VerificationType type, LocalDateTime now
    );

    Optional<VerificationCode> findTopByEmailAndTypeOrderByCreatedAtDesc(
            String email, VerificationType type
    );

    List<VerificationCode> findByEmailAndTypeAndUsedFalse(String email, VerificationType type);

    List<VerificationCode> findByUserIdAndTypeAndUsedFalse(Long userId, VerificationType type);
}

package com.fintax.pro.controller;

import com.fintax.pro.dto.TaxSummaryDTO;
import com.fintax.pro.entity.PotTransaction;
import com.fintax.pro.entity.User;
import com.fintax.pro.service.AuthService;
import com.fintax.pro.service.PotService;
import com.fintax.pro.service.TaxService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tax")
public class TaxController {

    @Autowired
    private TaxService taxService;

    @Autowired
    private PotService potService;

    @Autowired
    private AuthService authService;

    @GetMapping("/summary")
    public ResponseEntity<TaxSummaryDTO> getTaxSummary() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.getUserByEmail(email);

        TaxSummaryDTO response = taxService.getTaxSummary(user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pot/history")
    public ResponseEntity<List<PotTransaction>> getPotHistory() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.getUserByEmail(email);

        List<PotTransaction> history = potService.getPotHistory(user);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/pot/simulate")
    public ResponseEntity<PotTransaction> simulatePotTransaction(@RequestBody Map<String, Object> body) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.getUserByEmail(email);

        String type = (String) body.get("type");
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        String description = (String) body.get("description");

        PotTransaction tx = potService.simulateTransaction(user, type, amount, description);
        return ResponseEntity.ok(tx);
    }
}

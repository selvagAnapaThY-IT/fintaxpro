package com.fintax.pro.controller;

import com.fintax.pro.dto.DashboardSummaryDTO.InsightDTO;
import com.fintax.pro.entity.User;
import com.fintax.pro.service.AuthService;
import com.fintax.pro.service.InsightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/insights")
public class InsightController {

    @Autowired
    private InsightService insightService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<List<InsightDTO>> getInsights() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.getUserByEmail(email);

        List<InsightDTO> list = insightService.getTop3Insights(user);
        return ResponseEntity.ok(list);
    }
}

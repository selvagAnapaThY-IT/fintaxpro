package com.fintax.pro.controller;

import com.fintax.pro.dto.AnalyticsOverviewDTO;
import com.fintax.pro.entity.User;
import com.fintax.pro.service.AnalyticsService;
import com.fintax.pro.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private AuthService authService;

    @GetMapping("/overview")
    public ResponseEntity<AnalyticsOverviewDTO> getOverview(
            @RequestParam(value = "period", defaultValue = "year") String period) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.getUserByEmail(email);

        AnalyticsOverviewDTO response = analyticsService.getAnalyticsOverview(user, period);
        return ResponseEntity.ok(response);
    }
}

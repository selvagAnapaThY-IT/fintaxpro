package com.fintax.pro.controller;

import com.fintax.pro.dto.AuthResponse;
import com.fintax.pro.dto.LoginRequest;
import com.fintax.pro.dto.RegisterRequest;
import com.fintax.pro.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<com.fintax.pro.dto.MessageResponse> forgotPassword(@Valid @RequestBody com.fintax.pro.dto.ForgotPasswordRequest request) {
        com.fintax.pro.dto.MessageResponse response = authService.forgotPassword(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<com.fintax.pro.dto.MessageResponse> resetPassword(@Valid @RequestBody com.fintax.pro.dto.ResetPasswordRequest request) {
        com.fintax.pro.dto.MessageResponse response = authService.resetPassword(request);
        return ResponseEntity.ok(response);
    }
}

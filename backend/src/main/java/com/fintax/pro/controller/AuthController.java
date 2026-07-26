package com.fintax.pro.controller;

import com.fintax.pro.dto.*;
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

    @PostMapping("/signup/request")
    public ResponseEntity<MessageResponse> requestSignupOtp(@Valid @RequestBody RegisterRequest request) {
        MessageResponse response = authService.requestSignupOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup/verify")
    public ResponseEntity<AuthResponse> verifySignupOtp(@Valid @RequestBody VerifyOtpRequest request) {
        AuthResponse response = authService.verifySignupOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup/resend")
    public ResponseEntity<MessageResponse> resendSignupOtp(@Valid @RequestBody ResendOtpRequest request) {
        MessageResponse response = authService.resendSignupOtp(request);
        return ResponseEntity.ok(response);
    }

    // Legacy register endpoint (Direct)
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
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        MessageResponse response = authService.forgotPassword(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        MessageResponse response = authService.resetPassword(request);
        return ResponseEntity.ok(response);
    }
}

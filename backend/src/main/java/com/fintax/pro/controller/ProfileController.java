package com.fintax.pro.controller;

import com.fintax.pro.dto.*;
import com.fintax.pro.entity.Profile;
import com.fintax.pro.entity.User;
import com.fintax.pro.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private AuthService authService;

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return authService.getUserByEmail(email);
    }

    @GetMapping
    public ResponseEntity<AuthResponse> getProfile() {
        User user = getAuthenticatedUser();
        Profile profile = authService.getProfileByUser(user);

        AuthResponse response = AuthResponse.builder()
                .token(null)
                .user(AuthResponse.UserDTO.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .build())
                .profile(AuthResponse.ProfileDTO.builder()
                        .mobile(profile.getMobile())
                        .businessType(profile.getBusinessType())
                        .pan(profile.getPan())
                        .aadhaar(profile.getAadhaar())
                        .gstin(profile.getGstin())
                        .city(profile.getCity())
                        .state(profile.getState())
                        .financialYear(profile.getFinancialYear())
                        .build())
                .build();

        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<ProfileDTO> updateProfile(@Valid @RequestBody ProfileDTO dto) {
        User user = getAuthenticatedUser();
        Profile updated = authService.updateProfile(user, dto);

        ProfileDTO response = ProfileDTO.builder()
                .name(user.getName())
                .email(user.getEmail())
                .mobile(updated.getMobile())
                .businessType(updated.getBusinessType())
                .pan(updated.getPan())
                .aadhaar(updated.getAadhaar())
                .gstin(updated.getGstin())
                .city(updated.getCity())
                .state(updated.getState())
                .financialYear(updated.getFinancialYear())
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-email/request")
    public ResponseEntity<MessageResponse> requestEmailChange(@Valid @RequestBody ChangeEmailRequest request) {
        User user = getAuthenticatedUser();
        MessageResponse response = authService.requestEmailChange(user, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-email/verify")
    public ResponseEntity<AuthResponse> verifyEmailChange(@Valid @RequestBody VerifyOtpRequest request) {
        User user = getAuthenticatedUser();
        AuthResponse response = authService.verifyEmailChange(user, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password/request")
    public ResponseEntity<MessageResponse> requestPasswordChange(@Valid @RequestBody ChangePasswordRequest request) {
        User user = getAuthenticatedUser();
        MessageResponse response = authService.requestPasswordChange(user, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password/verify")
    public ResponseEntity<MessageResponse> verifyPasswordChange(@Valid @RequestBody VerifyOtpRequest request) {
        User user = getAuthenticatedUser();
        MessageResponse response = authService.verifyPasswordChange(user, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-phone/request")
    public ResponseEntity<MessageResponse> requestPhoneChange(@Valid @RequestBody ChangePhoneRequest request) {
        User user = getAuthenticatedUser();
        MessageResponse response = authService.requestPhoneChange(user, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-phone/verify")
    public ResponseEntity<ProfileDTO> verifyPhoneChange(@Valid @RequestBody VerifyOtpRequest request) {
        User user = getAuthenticatedUser();
        Profile updated = authService.verifyPhoneChange(user, request);

        ProfileDTO response = ProfileDTO.builder()
                .name(user.getName())
                .email(user.getEmail())
                .mobile(updated.getMobile())
                .businessType(updated.getBusinessType())
                .pan(updated.getPan())
                .aadhaar(updated.getAadhaar())
                .gstin(updated.getGstin())
                .city(updated.getCity())
                .state(updated.getState())
                .financialYear(updated.getFinancialYear())
                .build();

        return ResponseEntity.ok(response);
    }
}

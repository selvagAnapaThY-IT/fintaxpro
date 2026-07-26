package com.fintax.pro.controller;

import com.fintax.pro.dto.AuthResponse;
import com.fintax.pro.dto.ProfileDTO;
import com.fintax.pro.entity.Profile;
import com.fintax.pro.entity.User;
import com.fintax.pro.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private AuthService authService;

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getMe() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.getUserByEmail(email);
        Profile profile = authService.getProfileByUser(user);

        AuthResponse response = AuthResponse.builder()
                .token(null) // no token refresh needed for simple /me
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

    @PostMapping("/profile/request-otp")
    public ResponseEntity<com.fintax.pro.dto.MessageResponse> requestProfileOtp() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.getUserByEmail(email);
        com.fintax.pro.dto.MessageResponse response = authService.requestProfileOtp(user);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileDTO> updateProfile(@Valid @RequestBody ProfileDTO dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.getUserByEmail(email);
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
}

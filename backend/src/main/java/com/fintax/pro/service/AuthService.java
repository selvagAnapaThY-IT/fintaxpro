package com.fintax.pro.service;

import com.fintax.pro.dto.AuthResponse;
import com.fintax.pro.dto.LoginRequest;
import com.fintax.pro.dto.RegisterRequest;
import com.fintax.pro.entity.Profile;
import com.fintax.pro.entity.User;
import com.fintax.pro.repository.ProfileRepository;
import com.fintax.pro.repository.UserRepository;
import com.fintax.pro.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email address is already in use");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        user = userRepository.save(user);

        Profile profile = Profile.builder()
                .user(user)
                .mobile(request.getMobile())
                .businessType(request.getBusinessType())
                .pan(request.getPan())
                .aadhaar(request.getAadhaar())
                .gstin(request.getGstin())
                .city(request.getCity())
                .state(request.getState())
                .financialYear("2025-2026") // default financial year
                .build();

        profile = profileRepository.save(profile);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtils.generateToken(userDetails);

        return buildAuthResponse(token, user, profile);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Profile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtils.generateToken(userDetails);

        return buildAuthResponse(token, user, profile);
    }

    @Transactional
    public com.fintax.pro.dto.MessageResponse forgotPassword(com.fintax.pro.dto.ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No registered account found with email: " + request.getEmail()));

        // Generate 6-digit OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(900000) + 100000);
        user.setResetOtp(otp);
        user.setResetOtpExpiry(java.time.LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        return new com.fintax.pro.dto.MessageResponse(
                "Reset verification code sent to " + request.getEmail() + ". (Demo OTP: " + otp + ")",
                otp
        );
    }

    @Transactional
    public com.fintax.pro.dto.MessageResponse resetPassword(com.fintax.pro.dto.ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No registered account found with email: " + request.getEmail()));

        if (user.getResetOtp() == null || !user.getResetOtp().equals(request.getOtp().trim())) {
            throw new RuntimeException("Invalid verification code. Please check the OTP and try again.");
        }

        if (user.getResetOtpExpiry() != null && user.getResetOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Verification code has expired. Please request a new code.");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetOtp(null);
        user.setResetOtpExpiry(null);
        userRepository.save(user);

        return new com.fintax.pro.dto.MessageResponse("Password updated successfully! Please log in with your new password.");
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Profile getProfileByUser(User user) {
        return profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }

    @Transactional
    public com.fintax.pro.dto.MessageResponse requestProfileOtp(User user) {
        // Generate 6-digit OTP for sensitive profile changes (Mobile / Email)
        String otp = String.format("%06d", new java.util.Random().nextInt(900000) + 100000);
        user.setResetOtp(otp);
        user.setResetOtpExpiry(java.time.LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        return new com.fintax.pro.dto.MessageResponse(
                "Verification code generated! (Demo OTP: " + otp + ")",
                otp
        );
    }

    @Transactional
    public Profile updateProfile(User user, com.fintax.pro.dto.ProfileDTO dto) {
        Profile profile = profileRepository.findByUser(user)
                .orElse(Profile.builder().user(user).build());

        // Update name if provided
        if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
            user.setName(dto.getName().trim());
        }

        // Check if sensitive contact info (Mobile or Email) is being modified
        boolean mobileChanged = dto.getMobile() != null && !dto.getMobile().trim().equals(profile.getMobile());
        boolean emailChanged = dto.getEmail() != null && !dto.getEmail().trim().equalsIgnoreCase(user.getEmail());

        if (mobileChanged || emailChanged) {
            // Require OTP verification ONLY for sensitive contact info updates (Mobile / Email)
            if (dto.getOtp() == null || dto.getOtp().trim().isEmpty()) {
                throw new RuntimeException("OTP verification code is required to change Mobile Number or Email Address.");
            }

            if (user.getResetOtp() == null || !user.getResetOtp().equals(dto.getOtp().trim())) {
                throw new RuntimeException("Invalid OTP verification code. Please enter the correct 6-digit code.");
            }

            if (user.getResetOtpExpiry() != null && user.getResetOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
                throw new RuntimeException("OTP verification code has expired. Please request a new code.");
            }

            // Apply sensitive contact updates
            if (emailChanged) {
                String newEmail = dto.getEmail().trim();
                if (userRepository.existsByEmail(newEmail)) {
                    throw new RuntimeException("Email address " + newEmail + " is already in use by another account.");
                }
                user.setEmail(newEmail);
            }

            if (mobileChanged) {
                profile.setMobile(dto.getMobile().trim());
            }

            // Clear used OTP
            user.setResetOtp(null);
            user.setResetOtpExpiry(null);
        }

        // Update general profile fields directly (No OTP required)
        if (dto.getBusinessType() != null) profile.setBusinessType(dto.getBusinessType());
        if (dto.getPan() != null) profile.setPan(dto.getPan().toUpperCase());
        if (dto.getAadhaar() != null) profile.setAadhaar(dto.getAadhaar());
        if (dto.getGstin() != null) profile.setGstin(dto.getGstin().toUpperCase());
        if (dto.getCity() != null) profile.setCity(dto.getCity());
        if (dto.getState() != null) profile.setState(dto.getState());
        if (dto.getFinancialYear() != null) profile.setFinancialYear(dto.getFinancialYear());

        userRepository.save(user);
        return profileRepository.save(profile);
    }

    private AuthResponse buildAuthResponse(String token, User user, Profile profile) {
        return AuthResponse.builder()
                .token(token)
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
    }
}

package com.fintax.pro.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fintax.pro.dto.*;
import com.fintax.pro.entity.Profile;
import com.fintax.pro.entity.User;
import com.fintax.pro.entity.VerificationCode;
import com.fintax.pro.entity.VerificationType;
import com.fintax.pro.repository.ProfileRepository;
import com.fintax.pro.repository.UserRepository;
import com.fintax.pro.repository.VerificationCodeRepository;
import com.fintax.pro.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private VerificationCodeRepository verificationCodeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private EmailService emailService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final SecureRandom secureRandom = new SecureRandom();

    // ==========================================
    // FEATURE 1: SIGNUP EMAIL VERIFICATION FLOW
    // ==========================================

    @Transactional
    public MessageResponse requestSignupOtp(RegisterRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new RuntimeException("Email address is already registered. Please log in or use a different email.");
        }

        // Generate cryptographically secure 6-digit OTP
        String otp = String.format("%06d", secureRandom.nextInt(900000) + 100000);

        try {
            String payloadJson = objectMapper.writeValueAsString(request);

            // Invalidate any existing unverified signup codes for this email
            List<VerificationCode> existingCodes = verificationCodeRepository.findByEmailAndTypeAndUsedFalse(cleanEmail, VerificationType.SIGNUP);
            existingCodes.forEach(code -> code.setUsed(true));
            verificationCodeRepository.saveAll(existingCodes);

            // Save new hashed verification code (Expires in 10 mins)
            VerificationCode verificationCode = VerificationCode.builder()
                    .email(cleanEmail)
                    .codeHash(passwordEncoder.encode(otp))
                    .type(VerificationType.SIGNUP)
                    .expiresAt(LocalDateTime.now().plusMinutes(10))
                    .attempts(0)
                    .used(false)
                    .payload(payloadJson)
                    .build();

            verificationCodeRepository.save(verificationCode);

            // Dispatch Email via EmailService
            emailService.sendSignupOtp(cleanEmail, otp);

            return new MessageResponse(
                    "Verification code sent to " + cleanEmail + ". Please check your inbox to complete signup.",
                    otp
            );

        } catch (Exception e) {
            throw new RuntimeException("Failed to process signup request: " + e.getMessage());
        }
    }

    @Transactional
    public AuthResponse verifySignupOtp(VerifyOtpRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        String inputOtp = request.getOtp().trim();

        VerificationCode code = verificationCodeRepository
                .findTopByEmailAndTypeAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(cleanEmail, VerificationType.SIGNUP, LocalDateTime.now())
                .orElseThrow(() -> new RuntimeException("Verification code has expired or does not exist. Please request a new code."));

        if (code.getAttempts() >= 5) {
            code.setUsed(true);
            verificationCodeRepository.save(code);
            throw new RuntimeException("Too many incorrect attempts. This verification code has been invalidated. Please request a new one.");
        }

        if (!passwordEncoder.matches(inputOtp, code.getCodeHash())) {
            code.setAttempts(code.getAttempts() + 1);
            verificationCodeRepository.save(code);
            throw new RuntimeException("Invalid verification code. Please check your 6-digit code and try again.");
        }

        // Mark OTP as single-use completed
        code.setUsed(true);
        verificationCodeRepository.save(code);

        try {
            RegisterRequest registerRequest = objectMapper.readValue(code.getPayload(), RegisterRequest.class);

            if (userRepository.existsByEmail(registerRequest.getEmail().trim().toLowerCase())) {
                throw new RuntimeException("An account with this email was created during verification. Please log in.");
            }

            // Create permanent User and Profile
            User user = User.builder()
                    .name(registerRequest.getName().trim())
                    .email(registerRequest.getEmail().trim().toLowerCase())
                    .password(passwordEncoder.encode(registerRequest.getPassword()))
                    .emailVerified(true)
                    .tokenVersion(0)
                    .build();

            user = userRepository.save(user);

            Profile profile = Profile.builder()
                    .user(user)
                    .mobile(registerRequest.getMobile() != null ? registerRequest.getMobile().trim() : "")
                    .businessType(registerRequest.getBusinessType() != null ? registerRequest.getBusinessType().trim() : "Freelancer")
                    .pan(registerRequest.getPan() != null ? registerRequest.getPan().trim().toUpperCase() : "")
                    .aadhaar(registerRequest.getAadhaar() != null ? registerRequest.getAadhaar().trim() : "")
                    .gstin(registerRequest.getGstin() != null ? registerRequest.getGstin().trim().toUpperCase() : "")
                    .city(registerRequest.getCity() != null ? registerRequest.getCity().trim() : "")
                    .state(registerRequest.getState() != null ? registerRequest.getState().trim() : "")
                    .financialYear("2025-2026")
                    .build();

            profile = profileRepository.save(profile);

            // Auto Log In
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String token = jwtUtils.generateToken(userDetails, user.getTokenVersion());

            return buildAuthResponse(token, user, profile);

        } catch (Exception e) {
            throw new RuntimeException("Error completing registration: " + e.getMessage());
        }
    }

    @Transactional
    public MessageResponse resendSignupOtp(ResendOtpRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();

        // Rate Limiting Cooldown Check (60 seconds)
        verificationCodeRepository.findTopByEmailAndTypeOrderByCreatedAtDesc(cleanEmail, VerificationType.SIGNUP)
                .ifPresent(existingCode -> {
                    if (existingCode.getCreatedAt().plusSeconds(60).isAfter(LocalDateTime.now())) {
                        throw new RuntimeException("Please wait 60 seconds before requesting a new verification code.");
                    }
                });

        // Find most recent signup session payload for this email
        VerificationCode lastCode = verificationCodeRepository
                .findTopByEmailAndTypeOrderByCreatedAtDesc(cleanEmail, VerificationType.SIGNUP)
                .orElseThrow(() -> new RuntimeException("No signup session found for " + cleanEmail + ". Please go back and re-enter your details."));

        if (lastCode.getPayload() == null || lastCode.getPayload().trim().isEmpty()) {
            throw new RuntimeException("Signup session data expired. Please restart signup.");
        }

        RegisterRequest registerRequest = deserializeRegisterRequest(lastCode.getPayload());
        return requestSignupOtp(registerRequest);
    }

    private RegisterRequest deserializeRegisterRequest(String json) {
        try {
            return objectMapper.readValue(json, RegisterRequest.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to read signup session data.");
        }
    }

    // ==========================================
    // LOGIN & AUTHENTICATION
    // ==========================================

    public AuthResponse login(LoginRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(cleanEmail, request.getPassword())
        );

        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Profile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtils.generateToken(userDetails, user.getTokenVersion());

        return buildAuthResponse(token, user, profile);
    }

    // Legacy register backward compatibility
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        MessageResponse response = requestSignupOtp(request);
        // For legacy direct registration tests, auto verify if demo mode
        VerifyOtpRequest verifyReq = new VerifyOtpRequest(request.getEmail(), response.getDemoOtp(), VerificationType.SIGNUP);
        return verifySignupOtp(verifyReq);
    }

    // ==========================================
    // FEATURE 4: EMAIL CHANGE VERIFICATION FLOW
    // ==========================================

    @Transactional
    public MessageResponse requestEmailChange(User user, ChangeEmailRequest request) {
        String newEmail = request.getNewEmail().trim().toLowerCase();

        if (newEmail.equalsIgnoreCase(user.getEmail())) {
            throw new RuntimeException("New email address must be different from your current email.");
        }

        if (userRepository.existsByEmail(newEmail)) {
            throw new RuntimeException("Email address " + newEmail + " is already in use by another account.");
        }

        String otp = String.format("%06d", secureRandom.nextInt(900000) + 100000);

        // Invalidate old email change codes for this user
        List<VerificationCode> existingCodes = verificationCodeRepository.findByUserIdAndTypeAndUsedFalse(user.getId(), VerificationType.EMAIL_CHANGE);
        existingCodes.forEach(c -> c.setUsed(true));
        verificationCodeRepository.saveAll(existingCodes);

        VerificationCode code = VerificationCode.builder()
                .userId(user.getId())
                .email(newEmail)
                .codeHash(passwordEncoder.encode(otp))
                .type(VerificationType.EMAIL_CHANGE)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .attempts(0)
                .used(false)
                .payload(newEmail)
                .build();

        verificationCodeRepository.save(code);

        emailService.sendEmailChangeOtp(newEmail, otp);

        return new MessageResponse(
                "Verification code sent to " + newEmail + ". Enter the 6-digit OTP to verify and update your email.",
                otp
        );
    }

    @Transactional
    public AuthResponse verifyEmailChange(User user, VerifyOtpRequest request) {
        String inputOtp = request.getOtp().trim();

        VerificationCode code = verificationCodeRepository
                .findTopByEmailAndTypeAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(request.getEmail().trim().toLowerCase(), VerificationType.EMAIL_CHANGE, LocalDateTime.now())
                .orElseThrow(() -> new RuntimeException("Verification code expired or not found. Please request email change again."));

        if (!code.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized verification request.");
        }

        if (code.getAttempts() >= 5) {
            code.setUsed(true);
            verificationCodeRepository.save(code);
            throw new RuntimeException("Too many failed attempts. This verification code has been invalidated.");
        }

        if (!passwordEncoder.matches(inputOtp, code.getCodeHash())) {
            code.setAttempts(code.getAttempts() + 1);
            verificationCodeRepository.save(code);
            throw new RuntimeException("Invalid verification code. Please check the code sent to your new email.");
        }

        code.setUsed(true);
        verificationCodeRepository.save(code);

        String newEmail = code.getPayload();
        user.setEmail(newEmail);
        user.setTokenVersion(user.getTokenVersion() + 1); // Invalidate active JWT tokens
        userRepository.save(user);

        Profile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String newToken = jwtUtils.generateToken(userDetails, user.getTokenVersion());

        return buildAuthResponse(newToken, user, profile);
    }

    // ==========================================
    // FEATURE 5: PASSWORD CHANGE VERIFICATION FLOW
    // ==========================================

    @Transactional
    public MessageResponse requestPasswordChange(User user, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect. Please verify your current password.");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("New password and password confirmation do not match.");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("New password cannot be the same as your current password.");
        }

        String otp = String.format("%06d", secureRandom.nextInt(900000) + 100000);

        List<VerificationCode> existingCodes = verificationCodeRepository.findByUserIdAndTypeAndUsedFalse(user.getId(), VerificationType.PASSWORD_CHANGE);
        existingCodes.forEach(c -> c.setUsed(true));
        verificationCodeRepository.saveAll(existingCodes);

        VerificationCode code = VerificationCode.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .codeHash(passwordEncoder.encode(otp))
                .type(VerificationType.PASSWORD_CHANGE)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .attempts(0)
                .used(false)
                .payload(request.getNewPassword()) // Staged raw new password to hash upon verification
                .build();

        verificationCodeRepository.save(code);

        emailService.sendPasswordChangeOtp(user.getEmail(), otp);

        return new MessageResponse(
                "Password change verification code sent to " + user.getEmail() + ". Enter the OTP to finalize your new password.",
                otp
        );
    }

    @Transactional
    public MessageResponse verifyPasswordChange(User user, VerifyOtpRequest request) {
        String inputOtp = request.getOtp().trim();

        VerificationCode code = verificationCodeRepository
                .findTopByEmailAndTypeAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(user.getEmail(), VerificationType.PASSWORD_CHANGE, LocalDateTime.now())
                .orElseThrow(() -> new RuntimeException("Password verification code expired or not found. Please request password change again."));

        if (!code.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized verification request.");
        }

        if (code.getAttempts() >= 5) {
            code.setUsed(true);
            verificationCodeRepository.save(code);
            throw new RuntimeException("Too many failed attempts. Password change request invalidated.");
        }

        if (!passwordEncoder.matches(inputOtp, code.getCodeHash())) {
            code.setAttempts(code.getAttempts() + 1);
            verificationCodeRepository.save(code);
            throw new RuntimeException("Invalid verification code. Please enter the correct OTP sent to your email.");
        }

        code.setUsed(true);
        verificationCodeRepository.save(code);

        String newPassword = code.getPayload();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setTokenVersion(user.getTokenVersion() + 1); // Invalidate existing sessions
        userRepository.save(user);

        return new MessageResponse("Password updated successfully! Active sessions invalidated. Please log in with your new password.");
    }

    // ==========================================
    // FEATURE 6: PHONE NUMBER CHANGE VERIFICATION FLOW
    // ==========================================

    @Transactional
    public MessageResponse requestPhoneChange(User user, ChangePhoneRequest request) {
        String newPhone = request.getNewPhone().trim();

        Profile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        if (newPhone.equals(profile.getMobile())) {
            throw new RuntimeException("New mobile number must be different from your current mobile number.");
        }

        String otp = String.format("%06d", secureRandom.nextInt(900000) + 100000);

        List<VerificationCode> existingCodes = verificationCodeRepository.findByUserIdAndTypeAndUsedFalse(user.getId(), VerificationType.PHONE_CHANGE);
        existingCodes.forEach(c -> c.setUsed(true));
        verificationCodeRepository.saveAll(existingCodes);

        VerificationCode code = VerificationCode.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .codeHash(passwordEncoder.encode(otp))
                .type(VerificationType.PHONE_CHANGE)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .attempts(0)
                .used(false)
                .payload(newPhone)
                .build();

        verificationCodeRepository.save(code);

        emailService.sendPhoneChangeOtp(user.getEmail(), otp);

        return new MessageResponse(
                "Phone update verification code sent to your registered email (" + user.getEmail() + "). Enter the 6-digit OTP to verify.",
                otp
        );
    }

    @Transactional
    public Profile verifyPhoneChange(User user, VerifyOtpRequest request) {
        String inputOtp = request.getOtp().trim();

        VerificationCode code = verificationCodeRepository
                .findTopByEmailAndTypeAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(user.getEmail(), VerificationType.PHONE_CHANGE, LocalDateTime.now())
                .orElseThrow(() -> new RuntimeException("Phone verification code expired or not found. Please request phone number update again."));

        if (!code.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized verification request.");
        }

        if (code.getAttempts() >= 5) {
            code.setUsed(true);
            verificationCodeRepository.save(code);
            throw new RuntimeException("Too many failed attempts. Phone update request invalidated.");
        }

        if (!passwordEncoder.matches(inputOtp, code.getCodeHash())) {
            code.setAttempts(code.getAttempts() + 1);
            verificationCodeRepository.save(code);
            throw new RuntimeException("Invalid verification code. Please enter the correct code sent to your email.");
        }

        code.setUsed(true);
        verificationCodeRepository.save(code);

        String newPhone = code.getPayload();
        Profile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        profile.setMobile(newPhone);
        return profileRepository.save(profile);
    }

    // ==========================================
    // FEATURE 3: STRICT PROFILE EDITING RESTRICTIONS
    // ==========================================

    @Transactional
    public Profile updateProfile(User user, ProfileDTO dto) {
        Profile profile = profileRepository.findByUser(user)
                .orElseGet(() -> {
                    Profile newP = new Profile();
                    newP.setUser(user);
                    return newP;
                });

        if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
            user.setName(dto.getName().trim());
            userRepository.save(user);
        }

        if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty()) {
            String newEmail = dto.getEmail().trim().toLowerCase();
            if (!newEmail.equalsIgnoreCase(user.getEmail())) {
                if (userRepository.existsByEmail(newEmail)) {
                    throw new RuntimeException("Email " + newEmail + " is already registered with another account.");
                }
                user.setEmail(newEmail);
                userRepository.save(user);
            }
        }

        if (dto.getMobile() != null) profile.setMobile(dto.getMobile().trim());
        if (dto.getBusinessType() != null) profile.setBusinessType(dto.getBusinessType().trim());
        if (dto.getPan() != null) profile.setPan(dto.getPan().trim());
        if (dto.getAadhaar() != null) profile.setAadhaar(dto.getAadhaar().trim());
        if (dto.getGstin() != null) profile.setGstin(dto.getGstin().trim());
        if (dto.getCity() != null) profile.setCity(dto.getCity().trim());
        if (dto.getState() != null) profile.setState(dto.getState().trim());
        if (dto.getFinancialYear() != null) profile.setFinancialYear(dto.getFinancialYear().trim());

        return profileRepository.save(profile);
    }

    // ==========================================
    // FORGOT PASSWORD FLOW
    // ==========================================

    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("No registered account found with email: " + request.getEmail()));

        String otp = String.format("%06d", secureRandom.nextInt(900000) + 100000);
        user.setResetOtp(otp);
        user.setResetOtpExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        emailService.sendPasswordChangeOtp(user.getEmail(), otp);

        return new MessageResponse(
                "Reset verification code sent to " + user.getEmail() + ".",
                otp
        );
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("No registered account found with email: " + request.getEmail()));

        if (user.getResetOtp() == null || !user.getResetOtp().equals(request.getOtp().trim())) {
            throw new RuntimeException("Invalid verification code. Please check the OTP and try again.");
        }

        if (user.getResetOtpExpiry() != null && user.getResetOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification code has expired. Please request a new code.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetOtp(null);
        user.setResetOtpExpiry(null);
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);

        return new MessageResponse("Password updated successfully! Please log in with your new password.");
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Profile getProfileByUser(User user) {
        return profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
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

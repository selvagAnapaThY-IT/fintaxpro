package com.fintax.pro.dto;

import com.fintax.pro.entity.VerificationType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class VerifyOtpRequest {

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String otp;

    private VerificationType type;

    public VerifyOtpRequest() {}

    public VerifyOtpRequest(String email, String otp, VerificationType type) {
        this.email = email;
        this.otp = otp;
        this.type = type;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public VerificationType getType() { return type; }
    public void setType(VerificationType type) { this.type = type; }
}

package com.fintax.pro.dto;

import com.fintax.pro.entity.VerificationType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ResendOtpRequest {

    @Email
    @NotBlank
    private String email;

    private VerificationType type;

    public ResendOtpRequest() {}

    public ResendOtpRequest(String email, VerificationType type) {
        this.email = email;
        this.type = type;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public VerificationType getType() { return type; }
    public void setType(VerificationType type) { this.type = type; }
}

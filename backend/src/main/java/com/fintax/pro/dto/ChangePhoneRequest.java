package com.fintax.pro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ChangePhoneRequest {

    @NotBlank(message = "New mobile number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must be a valid 10-digit number")
    private String newPhone;

    public ChangePhoneRequest() {}

    public ChangePhoneRequest(String newPhone) {
        this.newPhone = newPhone;
    }

    public String getNewPhone() { return newPhone; }
    public void setNewPhone(String newPhone) { this.newPhone = newPhone; }
}

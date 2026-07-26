package com.fintax.pro.dto;

import jakarta.validation.constraints.NotBlank;

public class ProfileDTO {

    private String name;
    private String email;
    private String otp;

    @NotBlank(message = "Mobile number is required")
    private String mobile;

    @NotBlank(message = "Business type is required")
    private String businessType;

    @NotBlank(message = "PAN is required")
    private String pan;

    @NotBlank(message = "Aadhaar is required")
    private String aadhaar;

    private String gstin;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Financial year is required")
    private String financialYear;

    public ProfileDTO() {}

    public ProfileDTO(String name, String email, String otp, String mobile, String businessType, String pan, String aadhaar, String gstin, String city, String state, String financialYear) {
        this.name = name;
        this.email = email;
        this.otp = otp;
        this.mobile = mobile;
        this.businessType = businessType;
        this.pan = pan;
        this.aadhaar = aadhaar;
        this.gstin = gstin;
        this.city = city;
        this.state = state;
        this.financialYear = financialYear;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getBusinessType() { return businessType; }
    public void setBusinessType(String businessType) { this.businessType = businessType; }

    public String getPan() { return pan; }
    public void setPan(String pan) { this.pan = pan; }

    public String getAadhaar() { return aadhaar; }
    public void setAadhaar(String aadhaar) { this.aadhaar = aadhaar; }

    public String getGstin() { return gstin; }
    public void setGstin(String gstin) { this.gstin = gstin; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getFinancialYear() { return financialYear; }
    public void setFinancialYear(String financialYear) { this.financialYear = financialYear; }

    // Builder
    public static ProfileDTOBuilder builder() {
        return new ProfileDTOBuilder();
    }

    public static class ProfileDTOBuilder {
        private String name;
        private String email;
        private String otp;
        private String mobile;
        private String businessType;
        private String pan;
        private String aadhaar;
        private String gstin;
        private String city;
        private String state;
        private String financialYear;

        public ProfileDTOBuilder name(String name) { this.name = name; return this; }
        public ProfileDTOBuilder email(String email) { this.email = email; return this; }
        public ProfileDTOBuilder otp(String otp) { this.otp = otp; return this; }
        public ProfileDTOBuilder mobile(String mobile) { this.mobile = mobile; return this; }
        public ProfileDTOBuilder businessType(String businessType) { this.businessType = businessType; return this; }
        public ProfileDTOBuilder pan(String pan) { this.pan = pan; return this; }
        public ProfileDTOBuilder aadhaar(String aadhaar) { this.aadhaar = aadhaar; return this; }
        public ProfileDTOBuilder gstin(String gstin) { this.gstin = gstin; return this; }
        public ProfileDTOBuilder city(String city) { this.city = city; return this; }
        public ProfileDTOBuilder state(String state) { this.state = state; return this; }
        public ProfileDTOBuilder financialYear(String financialYear) { this.financialYear = financialYear; return this; }

        public ProfileDTO build() {
            return new ProfileDTO(name, email, otp, mobile, businessType, pan, aadhaar, gstin, city, state, financialYear);
        }
    }
}

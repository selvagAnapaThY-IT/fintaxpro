package com.fintax.pro.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "profiles")
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String mobile;

    @Column(name = "business_type", nullable = false)
    private String businessType;

    @Column(nullable = false)
    private String pan;

    @Column(nullable = false)
    private String aadhaar;

    private String gstin;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(name = "financial_year", nullable = false)
    private String financialYear;

    public Profile() {}

    public Profile(Long id, User user, String mobile, String businessType, String pan, String aadhaar, String gstin, String city, String state, String financialYear) {
        this.id = id;
        this.user = user;
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
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

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
    public static ProfileBuilder builder() {
        return new ProfileBuilder();
    }

    public static class ProfileBuilder {
        private Long id;
        private User user;
        private String mobile;
        private String businessType;
        private String pan;
        private String aadhaar;
        private String gstin;
        private String city;
        private String state;
        private String financialYear;

        public ProfileBuilder id(Long id) { this.id = id; return this; }
        public ProfileBuilder user(User user) { this.user = user; return this; }
        public ProfileBuilder mobile(String mobile) { this.mobile = mobile; return this; }
        public ProfileBuilder businessType(String businessType) { this.businessType = businessType; return this; }
        public ProfileBuilder pan(String pan) { this.pan = pan; return this; }
        public ProfileBuilder aadhaar(String aadhaar) { this.aadhaar = aadhaar; return this; }
        public ProfileBuilder gstin(String gstin) { this.gstin = gstin; return this; }
        public ProfileBuilder city(String city) { this.city = city; return this; }
        public ProfileBuilder state(String state) { this.state = state; return this; }
        public ProfileBuilder financialYear(String financialYear) { this.financialYear = financialYear; return this; }

        public Profile build() {
            return new Profile(id, user, mobile, businessType, pan, aadhaar, gstin, city, state, financialYear);
        }
    }
}

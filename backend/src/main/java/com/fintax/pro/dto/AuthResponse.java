package com.fintax.pro.dto;

public class AuthResponse {
    private String token;
    private UserDTO user;
    private ProfileDTO profile;

    public AuthResponse() {}

    public AuthResponse(String token, UserDTO user, ProfileDTO profile) {
        this.token = token;
        this.user = user;
        this.profile = profile;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public UserDTO getUser() { return user; }
    public void setUser(UserDTO user) { this.user = user; }

    public ProfileDTO getProfile() { return profile; }
    public void setProfile(ProfileDTO profile) { this.profile = profile; }

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public static class AuthResponseBuilder {
        private String token;
        private UserDTO user;
        private ProfileDTO profile;

        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder user(UserDTO user) { this.user = user; return this; }
        public AuthResponseBuilder profile(ProfileDTO profile) { this.profile = profile; return this; }

        public AuthResponse build() {
            return new AuthResponse(token, user, profile);
        }
    }

    public static class UserDTO {
        private Long id;
        private String name;
        private String email;

        public UserDTO() {}

        public UserDTO(Long id, String name, String email) {
            this.id = id;
            this.name = name;
            this.email = email;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public static UserDTOBuilder builder() {
            return new UserDTOBuilder();
        }

        public static class UserDTOBuilder {
            private Long id;
            private String name;
            private String email;

            public UserDTOBuilder id(Long id) { this.id = id; return this; }
            public UserDTOBuilder name(String name) { this.name = name; return this; }
            public UserDTOBuilder email(String email) { this.email = email; return this; }

            public UserDTO build() {
                return new UserDTO(id, name, email);
            }
        }
    }

    public static class ProfileDTO {
        private String mobile;
        private String businessType;
        private String pan;
        private String aadhaar;
        private String gstin;
        private String city;
        private String state;
        private String financialYear;

        public ProfileDTO() {}

        public ProfileDTO(String mobile, String businessType, String pan, String aadhaar, String gstin, String city, String state, String financialYear) {
            this.mobile = mobile;
            this.businessType = businessType;
            this.pan = pan;
            this.aadhaar = aadhaar;
            this.gstin = gstin;
            this.city = city;
            this.state = state;
            this.financialYear = financialYear;
        }

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

        public static ProfileDTOBuilder builder() {
            return new ProfileDTOBuilder();
        }

        public static class ProfileDTOBuilder {
            private String mobile;
            private String businessType;
            private String pan;
            private String aadhaar;
            private String gstin;
            private String city;
            private String state;
            private String financialYear;

            public ProfileDTOBuilder mobile(String mobile) { this.mobile = mobile; return this; }
            public ProfileDTOBuilder businessType(String businessType) { this.businessType = businessType; return this; }
            public ProfileDTOBuilder pan(String pan) { this.pan = pan; return this; }
            public ProfileDTOBuilder aadhaar(String aadhaar) { this.aadhaar = aadhaar; return this; }
            public ProfileDTOBuilder gstin(String gstin) { this.gstin = gstin; return this; }
            public ProfileDTOBuilder city(String city) { this.city = city; return this; }
            public ProfileDTOBuilder state(String state) { this.state = state; return this; }
            public ProfileDTOBuilder financialYear(String financialYear) { this.financialYear = financialYear; return this; }

            public ProfileDTO build() {
                return new ProfileDTO(mobile, businessType, pan, aadhaar, gstin, city, state, financialYear);
            }
        }
    }
}

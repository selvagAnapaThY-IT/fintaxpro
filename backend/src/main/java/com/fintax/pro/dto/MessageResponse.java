package com.fintax.pro.dto;

public class MessageResponse {
    private String message;
    private String demoOtp;

    public MessageResponse() {}

    public MessageResponse(String message) {
        this.message = message;
    }

    public MessageResponse(String message, String demoOtp) {
        this.message = message;
        this.demoOtp = demoOtp;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getDemoOtp() { return demoOtp; }
    public void setDemoOtp(String demoOtp) { this.demoOtp = demoOtp; }
}

package com.fintax.pro.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender defaultMailSender;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${resend.api.key:}")
    private String resendApiKey;

    @Value("${resend.from.email:FinTax Pro <onboarding@resend.dev>}")
    private String resendFromEmail;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String mailHost;

    @Value("${spring.mail.port:587}")
    private int mailPort;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    public EmailService(JavaMailSender defaultMailSender) {
        this.defaultMailSender = defaultMailSender;
    }

    public boolean isLiveEmailConfigured() {
        boolean hasResendKey = resendApiKey != null && !resendApiKey.trim().isEmpty();
        boolean hasSmtpCreds = mailHost != null && !mailHost.trim().isEmpty() 
                && fromEmail != null && !fromEmail.trim().isEmpty()
                && mailPassword != null && !mailPassword.trim().isEmpty();
        return hasResendKey || hasSmtpCreds;
    }

    public void sendSignupOtp(String recipientEmail, String otp) {
        String subject = "Verify Your Email - FinTax Pro";
        String htmlContent = buildHtmlTemplate(
                "Welcome to FinTax Pro!",
                "Thank you for starting your registration. Please use the verification code below to verify your email address and complete your signup:",
                otp,
                "Signup Verification Code",
                "This code will expire in 10 minutes. If you did not request this code, please ignore this email."
        );
        CompletableFuture.runAsync(() -> sendEmail(recipientEmail, subject, htmlContent, otp, "SIGNUP_VERIFICATION"));
    }

    public void sendEmailChangeOtp(String recipientEmail, String otp) {
        String subject = "Verify Email Change - FinTax Pro";
        String htmlContent = buildHtmlTemplate(
                "Confirm Email Change",
                "We received a request to change the primary email address associated with your FinTax Pro account to this address. Use the OTP below to verify:",
                otp,
                "Email Change Code",
                "This code expires in 10 minutes. If you did not initiate this change, please contact support immediately and secure your account."
        );
        CompletableFuture.runAsync(() -> sendEmail(recipientEmail, subject, htmlContent, otp, "EMAIL_CHANGE_VERIFICATION"));
    }

    public void sendPasswordChangeOtp(String recipientEmail, String otp) {
        String subject = "Verify Password Change - FinTax Pro";
        String htmlContent = buildHtmlTemplate(
                "Password Security Alert",
                "A password change request was submitted for your FinTax Pro account. Use the following security verification code to authorize this change:",
                otp,
                "Password Change Code",
                "This code expires in 10 minutes. NEVER share this OTP with anyone, including FinTax Pro staff."
        );
        CompletableFuture.runAsync(() -> sendEmail(recipientEmail, subject, htmlContent, otp, "PASSWORD_CHANGE_VERIFICATION"));
    }

    public void sendPhoneChangeOtp(String recipientEmail, String otp) {
        String subject = "Verify Phone Number Change - FinTax Pro";
        String htmlContent = buildHtmlTemplate(
                "Phone Number Update Request",
                "A request was made to update the mobile number on your FinTax Pro profile. For security reasons, a verification code was sent to your registered email:",
                otp,
                "Phone Change Code",
                "This code expires in 10 minutes. If you did not request this update, please change your password immediately."
        );
        CompletableFuture.runAsync(() -> sendEmail(recipientEmail, subject, htmlContent, otp, "PHONE_CHANGE_VERIFICATION"));
    }

    private void sendEmail(String to, String subject, String htmlContent, String otp, String actionType) {
        logger.info("[EMAIL SERVICE] [{}] Target: {} | OTP Code: {}", actionType, to, otp);

        // 1. Primary Attempt: High-Reliability Resend HTTPS API
        if (sendViaResendHttpApi(to, subject, htmlContent, otp, actionType)) {
            return;
        }

        // 2. Secondary Attempt: Spring SMTP
        if (sendViaSmtp(to, subject, htmlContent, otp, actionType)) {
            return;
        }

        // 3. Fallback: Console Demo Logging
        logger.warn("[EMAIL SERVICE] All live email delivery options unavailable. Running in Demo Mode: OTP={}", otp);
    }

    private boolean sendViaResendHttpApi(String to, String subject, String htmlContent, String otp, String actionType) {
        String apiKey = (resendApiKey != null) ? resendApiKey.trim() : "";
        if (apiKey.isEmpty()) {
            return false;
        }

        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();

            String fromSender = (resendFromEmail != null && !resendFromEmail.trim().isEmpty())
                    ? resendFromEmail.trim()
                    : "FinTax Pro <onboarding@resend.dev>";

            Map<String, Object> bodyMap = new HashMap<>();
            bodyMap.put("from", fromSender);
            bodyMap.put("to", List.of(to.trim()));
            bodyMap.put("subject", subject);
            bodyMap.put("html", htmlContent);

            String jsonPayload = objectMapper.writeValueAsString(bodyMap);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                    .timeout(Duration.ofSeconds(10))
                    .build();

            HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                logger.info("[RESEND API] Live email successfully dispatched to {} via Resend HTTPS API! Response: {}", to, response.body());
                return true;
            } else {
                logger.warn("[RESEND API] Resend API returned error status {}: {}", response.statusCode(), response.body());
                return false;
            }
        } catch (Exception e) {
            logger.error("[RESEND API] Error calling Resend HTTPS API: {}", e.getMessage());
            return false;
        }
    }

    private boolean sendViaSmtp(String to, String subject, String htmlContent, String otp, String actionType) {
        String cleanHost = (mailHost != null && !mailHost.trim().isEmpty()) ? mailHost.trim() : "smtp.gmail.com";
        String cleanUser = (fromEmail != null) ? fromEmail.trim() : "";
        String cleanPass = (mailPassword != null) ? mailPassword.replaceAll("\\s+", "") : "";

        if (cleanUser.isEmpty() || cleanPass.isEmpty()) {
            return false;
        }

        try {
            JavaMailSenderImpl customSender = new JavaMailSenderImpl();
            customSender.setHost(cleanHost);
            customSender.setPort(mailPort > 0 ? mailPort : 587);
            customSender.setUsername(cleanUser);
            customSender.setPassword(cleanPass);

            Properties props = customSender.getJavaMailProperties();
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
            props.put("mail.smtp.ssl.trust", "*");
            props.put("mail.smtp.connectiontimeout", "8000");
            props.put("mail.smtp.timeout", "8000");
            props.put("mail.smtp.writetimeout", "8000");

            MimeMessage message = customSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(cleanUser, "FinTax Pro");
            helper.setTo(to.trim());
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            customSender.send(message);
            logger.info("[EMAIL SERVICE] Live SMTP email successfully sent to {} via {}", to, cleanUser);
            return true;
        } catch (Exception e) {
            logger.error("[EMAIL SERVICE] Failed to dispatch SMTP email to {}: {}", to, e.getMessage());
            return false;
        }
    }

    private String buildHtmlTemplate(String title, String description, String otp, String badgeLabel, String securityWarning) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head><meta charset='UTF-8'></head>"
                + "<body style='font-family: Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px;'>"
                + "<div style='max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);'>"
                + "  <div style='background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 25px; text-align: center; color: #ffffff;'>"
                + "    <h1 style='margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;'>FinTax Pro</h1>"
                + "    <p style='margin: 5px 0 0 0; font-size: 13px; color: #94a3b8;'>AI-Powered Tax & Financial Intelligence</p>"
                + "  </div>"
                + "  <div style='padding: 30px 25px; color: #334155;'>"
                + "    <h2 style='margin-top: 0; color: #0f172a; font-size: 20px;'>" + title + "</h2>"
                + "    <p style='font-size: 15px; line-height: 1.5; color: #475569;'>" + description + "</p>"
                + "    <div style='text-align: center; margin: 30px 0;'>"
                + "      <span style='display: inline-block; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 8px; font-weight: 600;'>" + badgeLabel + "</span>"
                + "      <div style='font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #2563eb; background-color: #eff6ff; padding: 14px 28px; border-radius: 10px; display: inline-block; border: 1px dashed #93c5fd;'>" + otp + "</div>"
                + "    </div>"
                + "    <div style='background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 4px; margin-top: 25px;'>"
                + "      <p style='margin: 0; font-size: 13px; color: #991b1b; line-height: 1.4;'><strong>Security Notice:</strong> " + securityWarning + "</p>"
                + "    </div>"
                + "  </div>"
                + "  <div style='background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;'>"
                + "    &copy; " + java.time.Year.now().getValue() + " FinTax Pro Platform. All rights reserved."
                + "  </div>"
                + "</div>"
                + "</body>"
                + "</html>";
    }
}

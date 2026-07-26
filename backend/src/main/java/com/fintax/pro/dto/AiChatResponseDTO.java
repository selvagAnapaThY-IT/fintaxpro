package com.fintax.pro.dto;

public class AiChatResponseDTO {

    private String reply;
    private String status;

    public AiChatResponseDTO() {}

    public AiChatResponseDTO(String reply, String status) {
        this.reply = reply;
        this.status = status;
    }

    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

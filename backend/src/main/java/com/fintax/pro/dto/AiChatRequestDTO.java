package com.fintax.pro.dto;

import jakarta.validation.constraints.NotBlank;

public class AiChatRequestDTO {

    @NotBlank(message = "Prompt cannot be empty")
    private String prompt;

    private String context;

    public AiChatRequestDTO() {}

    public AiChatRequestDTO(String prompt, String context) {
        this.prompt = prompt;
        this.context = context;
    }

    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }

    public String getContext() { return context; }
    public void setContext(String context) { this.context = context; }
}

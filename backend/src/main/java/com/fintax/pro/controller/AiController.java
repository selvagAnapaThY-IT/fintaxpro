package com.fintax.pro.controller;

import com.fintax.pro.dto.AiCategorizeRequestDTO;
import com.fintax.pro.dto.AiCategorizeResponseDTO;
import com.fintax.pro.dto.AiChatRequestDTO;
import com.fintax.pro.dto.AiChatResponseDTO;
import com.fintax.pro.entity.User;
import com.fintax.pro.service.AuthService;
import com.fintax.pro.service.GeminiService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private AuthService authService;

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponseDTO> chat(@Valid @RequestBody AiChatRequestDTO request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.getUserByEmail(email);

        String context = "User: " + user.getName() + " (" + user.getEmail() + ")";
        if (request.getContext() != null && !request.getContext().trim().isEmpty()) {
            context += " | " + request.getContext();
        }

        String reply = geminiService.askTaxAdvisor(request.getPrompt(), context);
        return ResponseEntity.ok(new AiChatResponseDTO(reply, "SUCCESS"));
    }

    @PostMapping("/categorize")
    public ResponseEntity<AiCategorizeResponseDTO> categorize(@Valid @RequestBody AiCategorizeRequestDTO request) {
        AiCategorizeResponseDTO result = geminiService.smartCategorize(
            request.getDescription(),
            request.getAmount(),
            request.getType()
        );
        return ResponseEntity.ok(result);
    }
}

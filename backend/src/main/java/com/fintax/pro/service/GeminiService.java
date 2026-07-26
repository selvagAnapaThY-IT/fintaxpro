package com.fintax.pro.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fintax.pro.dto.AiCategorizeResponseDTO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestClient restClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GeminiService() {

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();

        factory.setConnectTimeout(10000);
        factory.setReadTimeout(60000);

        this.restClient = RestClient.builder()
                .requestFactory(factory)
                .build();
    }

    /*
     * Only ONE model is used.
     * Your API key supports gemini-2.5-flash.
     */
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    // =========================================================
    // TAX CHATBOT
    // =========================================================

    public String askTaxAdvisor(String userPrompt, String userContext) {

        if (apiKey == null || apiKey.trim().isEmpty()) {

            logger.warn("Gemini API key is empty.");

            return generateMockTaxAdvice(userPrompt);
        }

        String systemPrompt = """
                You are FinTax AI, an expert Indian Chartered Accountant (CA)
                and tax consultant for Indian freelancers, consultants,
                IT professionals, and small businesses.

                Provide concise, clear, and accurate guidance on Indian tax laws.

                Important topics include:
                - Income Tax Act 1961
                - Section 44ADA
                - Section 44AD
                - GST
                - Advance Tax
                - Tax deductions

                User context:
                %s

                User question:
                %s
                """
                .formatted(
                        userContext != null
                                ? userContext
                                : "Freelancer under Section 44ADA",
                        userPrompt);

        Map<String, Object> requestBody = Map.of(
                "contents",
                List.of(
                        Map.of(
                                "parts",
                                List.of(
                                        Map.of(
                                                "text",
                                                systemPrompt)))));

        String rawResponse = executeGeminiCall(requestBody);

        if (rawResponse != null) {

            String parsedText = parseTextFromGeminiJson(rawResponse);

            if (parsedText != null &&
                    !parsedText.trim().isEmpty()) {

                return parsedText;
            }
        }

        return generateMockTaxAdvice(userPrompt);
    }

    // =========================================================
    // SMART TRANSACTION CATEGORIZATION
    // =========================================================

    public AiCategorizeResponseDTO smartCategorize(
            String description,
            BigDecimal amount,
            String typeHint) {

        if (description == null ||
                description.trim().isEmpty()) {

            return new AiCategorizeResponseDTO(
                    "EXPENSE",
                    "Other Expense",
                    "PERSONAL",
                    false,
                    BigDecimal.ZERO,
                    "Empty description");
        }

        if (apiKey == null ||
                apiKey.trim().isEmpty()) {

            return generateHeuristicCategorization(
                    description,
                    typeHint);
        }

        String systemPrompt = """
                Analyze the following financial transaction description
                and classify it for Indian freelancer/business tax management.

                Description: "%s"
                Amount: %s
                Type Hint: %s

                Respond with ONLY a valid JSON object.

                Do not use markdown.
                Do not use ```json.

                Use exactly these keys:

                {
                  "type": "INCOME" or "EXPENSE",
                  "category": "one valid category",
                  "tag": "BUSINESS" or "PERSONAL",
                  "isBusiness": true or false,
                  "gstRate": 0, 5, 12, or 18,
                  "reasoning": "short 1-sentence rationale"
                }

                Valid categories:
                Freelance Income
                Consulting
                SaaS Licensing
                Ad Revenue
                SaaS Subscription
                Office Rent
                Internet & Utilities
                Work Laptop
                Travel (Business)
                Groceries
                Dining Out
                Movies
                Rent (Home)
                Shopping (Personal)
                Tax Prep
                Hardware & Gadgets
                Other Expense
                """
                .formatted(
                        description,
                        amount != null
                                ? amount.toString()
                                : "N/A",
                        typeHint != null
                                ? typeHint
                                : "Auto");

        Map<String, Object> requestBody = Map.of(
                "contents",
                List.of(
                        Map.of(
                                "parts",
                                List.of(
                                        Map.of(
                                                "text",
                                                systemPrompt)))));

        String rawResponse = executeGeminiCall(requestBody);

        if (rawResponse != null) {

            try {

                String responseText = parseTextFromGeminiJson(rawResponse);

                if (responseText != null) {

                    responseText = responseText
                            .replace("```json", "")
                            .replace("```", "")
                            .trim();

                    JsonNode node = objectMapper.readTree(responseText);

                    String type = node.has("type")
                            ? node.get("type").asText()
                            : "EXPENSE";

                    String category = node.has("category")
                            ? node.get("category").asText()
                            : "Other Expense";

                    String tag = node.has("tag")
                            ? node.get("tag").asText()
                            : "BUSINESS";

                    boolean isBusiness = node.has("isBusiness")
                            ? node.get("isBusiness").asBoolean()
                            : "BUSINESS".equals(tag);

                    BigDecimal gstRate = node.has("gstRate")
                            ? new BigDecimal(
                                    node.get("gstRate").asText())
                            : BigDecimal.ZERO;

                    String reasoning = node.has("reasoning")
                            ? node.get("reasoning").asText()
                            : "Classified by Gemini AI";

                    return new AiCategorizeResponseDTO(
                            type,
                            category,
                            tag,
                            isBusiness,
                            gstRate,
                            reasoning);
                }

            } catch (Exception e) {

                logger.error(
                        "Error parsing Gemini categorization response",
                        e);
            }
        }

        return generateHeuristicCategorization(
                description,
                typeHint);
    }

    // =========================================================
    // GEMINI API CALL
    // =========================================================

    private String executeGeminiCall(
            Map<String, Object> requestBody) {

        String trimmedKey = apiKey != null
                ? apiKey.trim()
                : "";

        if (trimmedKey.isEmpty()) {

            logger.warn("Gemini API key is empty.");

            return null;
        }

        try {

            logger.info(
                    "Calling Gemini model: gemini-2.5-flash");

            String response = restClient.post()
                    .uri(GEMINI_URL)
                    .header(
                            "x-goog-api-key",
                            trimmedKey)
                    .contentType(
                            MediaType.APPLICATION_JSON)
                    .accept(
                            MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            logger.info(
                    "Gemini API response received successfully.");

            return response;

        } catch (Exception e) {

            logger.error(
                    "Gemini API call failed: {}",
                    e.getMessage(),
                    e);

            return null;
        }
    }

    // =========================================================
    // PARSE GEMINI RESPONSE
    // =========================================================

    private String parseTextFromGeminiJson(
            String rawJson) {

        try {

            JsonNode root = objectMapper.readTree(rawJson);

            JsonNode candidates = root.path("candidates");

            if (candidates.isArray() &&
                    candidates.size() > 0) {

                JsonNode parts = candidates
                        .get(0)
                        .path("content")
                        .path("parts");

                if (parts.isArray() &&
                        parts.size() > 0) {

                    StringBuilder result = new StringBuilder();

                    for (JsonNode part : parts) {

                        if (part.has("text")) {

                            String text = part.get("text").asText();

                            if (text != null &&
                                    !text.trim().isEmpty()) {

                                if (result.length() > 0) {
                                    result.append("\n");
                                }

                                result.append(text);
                            }
                        }
                    }

                    if (result.length() > 0) {
                        return result.toString();
                    }
                }
            }

        } catch (Exception e) {

            logger.error(
                    "Error parsing Gemini JSON response",
                    e);
        }

        return null;
    }

    // =========================================================
    // FALLBACK TAX ADVICE
    // =========================================================

    private String generateMockTaxAdvice(
            String prompt) {

        String lower = prompt.toLowerCase();

        if (lower.contains("44ada") ||
                lower.contains("presumptive")) {

            return """
                    ### Section 44ADA Presumptive Taxation Overview:

                    - Eligibility: Certain specified professionals.
                    - Deemed Profit: Generally 50% of gross receipts.
                    - Advance Tax: Applicable according to the applicable tax rules.
                    """;

        } else if (lower.contains("gst")) {

            return """
                    ### GST Rules:

                    GST registration requirements depend on
                    turnover, nature of supply, and applicable exemptions.

                    Consult a qualified tax professional for
                    current case-specific compliance.
                    """;
        }

        return """
                ### FinTax AI Advice:

                Keep accurate records of income and expenses,
                maintain supporting invoices, and verify applicable
                Indian tax rules before filing.
                """;
    }

    // =========================================================
    // HEURISTIC CATEGORIZATION FALLBACK
    // =========================================================

    private AiCategorizeResponseDTO generateHeuristicCategorization(
            String desc,
            String typeHint) {

        String lower = desc.toLowerCase();

        if (lower.contains("github") ||
                lower.contains("aws") ||
                lower.contains("google cloud") ||
                lower.contains("openai") ||
                lower.contains("cursor") ||
                lower.contains("vercel") ||
                lower.contains("jetbrains") ||
                lower.contains("figma")) {

            return new AiCategorizeResponseDTO(
                    "EXPENSE",
                    "SaaS Subscription",
                    "BUSINESS",
                    true,
                    new BigDecimal("18.00"),
                    "Recognized developer software subscription");

        } else if (lower.contains("macbook") ||
                lower.contains("laptop") ||
                lower.contains("monitor") ||
                lower.contains("keyboard") ||
                lower.contains("mouse")) {

            return new AiCategorizeResponseDTO(
                    "EXPENSE",
                    "Work Laptop",
                    "BUSINESS",
                    true,
                    new BigDecimal("18.00"),
                    "Identified business hardware");

        } else if (lower.contains("client") ||
                lower.contains("invoice") ||
                lower.contains("payment from") ||
                lower.contains("upwork") ||
                lower.contains("toptal") ||
                lower.contains("stipend") ||
                lower.contains("remittance")) {

            return new AiCategorizeResponseDTO(
                    "INCOME",
                    "Freelance Income",
                    "BUSINESS",
                    true,
                    BigDecimal.ZERO,
                    "Recognized freelance income");

        } else if (lower.contains("starbucks") ||
                lower.contains("swiggy") ||
                lower.contains("zomato") ||
                lower.contains("restaurant") ||
                lower.contains("cafe")) {

            return new AiCategorizeResponseDTO(
                    "EXPENSE",
                    "Dining Out",
                    "PERSONAL",
                    false,
                    BigDecimal.ZERO,
                    "Personal dining expense");

        } else if (lower.contains("uber") ||
                lower.contains("ola") ||
                lower.contains("flight") ||
                lower.contains("hotel")) {

            return new AiCategorizeResponseDTO(
                    "EXPENSE",
                    "Travel (Business)",
                    "BUSINESS",
                    true,
                    new BigDecimal("5.00"),
                    "Travel expense");
        }

        String type = "INCOME".equalsIgnoreCase(typeHint)
                ? "INCOME"
                : "EXPENSE";

        String category = "INCOME".equals(type)
                ? "Freelance Income"
                : "Other Expense";

        return new AiCategorizeResponseDTO(
                type,
                category,
                "BUSINESS",
                true,
                new BigDecimal("18.00"),
                "Default categorization");
    }
}
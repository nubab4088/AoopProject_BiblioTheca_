package com.bibliotheca.service;

import com.bibliotheca.model.Book;
import com.bibliotheca.repository.BookRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private final WebClient webClient;
    private final BookRepository bookRepository;
    private final ObjectMapper objectMapper; // Robust JSON parser

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com}") // Default if missing
    private String baseUrl;

    public GeminiService(WebClient.Builder webClientBuilder, BookRepository bookRepository) {
        this.webClient = webClientBuilder
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
        this.bookRepository = bookRepository;
        this.objectMapper = new ObjectMapper();
    }

    public String chat(String userMessage, String conversationHistory) {
        try {
            // 1. Prepare Context
            List<Book> books = bookRepository.findAll();
            String libraryContext = buildLibraryContext(books);
            String systemPrompt = buildGhostLibrarianPrompt(libraryContext);

            // 2. Build Prompt
            StringBuilder fullPrompt = new StringBuilder();
            fullPrompt.append(systemPrompt).append("\n\n");
            
            if (conversationHistory != null && !conversationHistory.trim().isEmpty()) {
                fullPrompt.append("Recent Conversation:\n")
                          .append(limitConversationHistory(conversationHistory, 3))
                          .append("\n\n");
            }
            
            fullPrompt.append("User Question: ").append(userMessage);

            // 3. Call API
            String response = callGeminiAPI(fullPrompt.toString());

            return response != null ? response : "👻 *The spirits are silent... (API returned null)*";

        } catch (Exception e) {
            e.printStackTrace();
            return "👻 *Connection to the netherworld is broken...*";
        }
    }

    // Helper methods (Context building logic remains the same)
    private String limitConversationHistory(String history, int maxExchanges) {
        if (history == null || history.trim().isEmpty()) return "";
        String[] lines = history.split("\n");
        StringBuilder limited = new StringBuilder();
        int count = 0;
        for (int i = lines.length - 1; i >= 0; i--) {
            if (lines[i].startsWith("User:") || lines[i].startsWith("Ghost")) count++;
            if (count > maxExchanges * 2) break;
            limited.insert(0, lines[i] + "\n");
        }
        return limited.toString();
    }

    private String buildLibraryContext(List<Book> books) {
        // Keep your existing logic here, it is fine
        StringBuilder context = new StringBuilder("Library Collection:\n");
        for(Book b : books) {
             if(b.isCorrupted()) context.append("⚠️ ").append(b.getTitle()).append(" (CORRUPTED)\n");
             else context.append("📚 ").append(b.getTitle()).append("\n");
        }
        return context.toString();
    }

    private String buildGhostLibrarianPrompt(String libraryContext) {
        return """
            You are the Ghost Librarian.
            Personality: Spooky, helpful, mysterious.
            Context:
            """ + libraryContext + """
            Rules: Warn about corrupted books. Be concise.
            """;
    }

    // --- CORE FIX IS HERE ---
    private String callGeminiAPI(String prompt) {
        try {
            // A. Build Request Payload
            Map<String, Object> requestBody = new HashMap<>();
            
            // Content
            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(Map.of("text", prompt)));
            requestBody.put("contents", List.of(content));

            // Config
            Map<String, Object> config = new HashMap<>();
            config.put("temperature", 0.9);
            config.put("maxOutputTokens", 200);
            requestBody.put("generationConfig", config);

            // SAFETY SETTINGS (CRITICAL FIX)
            // This prevents the "Ghost/Death" theme from being blocked
            List<Map<String, String>> safetySettings = new ArrayList<>();
            safetySettings.add(Map.of("category", "HARM_CATEGORY_HARASSMENT", "threshold", "BLOCK_NONE"));
            safetySettings.add(Map.of("category", "HARM_CATEGORY_HATE_SPEECH", "threshold", "BLOCK_NONE"));
            safetySettings.add(Map.of("category", "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold", "BLOCK_NONE"));
            safetySettings.add(Map.of("category", "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold", "BLOCK_NONE"));
            requestBody.put("safetySettings", safetySettings);

            // B. Execute Call - Fetch as STRING to debug
            String rawJson = webClient.post()
                    .uri("/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class) // <--- Fetch raw string first!
                    .timeout(Duration.ofSeconds(10))
                    .block();

            // C. Parse with Jackson (Safer than Map casting)
            JsonNode root = objectMapper.readTree(rawJson);
            
            // Check for candidates
            if (root.has("candidates") && root.get("candidates").isArray()) {
                JsonNode candidate = root.get("candidates").get(0);
                
                // Check if blocked by safety
                if (candidate.has("finishReason")) {
                    String reason = candidate.get("finishReason").asText();
                    if (!"STOP".equals(reason)) {
                        System.err.println("⚠️ Gemini stopped due to: " + reason);
                    }
                }

                // Extract text
                if (candidate.has("content") && candidate.get("content").has("parts")) {
                    return candidate.get("content").get("parts").get(0).get("text").asText();
                }
            }
            
            System.err.println("Raw Response (No valid text found): " + rawJson);
            return null;

        } catch (WebClientResponseException e) {
            System.err.println("API Error: " + e.getResponseBodyAsString());
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
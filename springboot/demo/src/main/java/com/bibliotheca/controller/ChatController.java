package com.bibliotheca.controller;

import com.bibliotheca.model.ChatRequest;
import com.bibliotheca.model.ChatResponse;
import com.bibliotheca.service.GeminiService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    private final GeminiService geminiService;

    public ChatController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest request) {
        try {
            // Pass both message and conversation history to service
            String aiResponse = geminiService.chat(request.getMessage(), request.getConversationHistory());
            
            // If service returns null or empty, return connection error
            if (aiResponse == null || aiResponse.trim().isEmpty()) {
                return new ChatResponse(
                    "👻 *The spirits are silent... (Connection Error)*",
                    false,
                    "AI service returned empty response"
                );
            }
            
            return new ChatResponse(aiResponse, true);
            
        } catch (Exception e) {
            // Log the error for debugging
            System.err.println("ChatController error: " + e.getMessage());
            
            // Return user-friendly error message
            return new ChatResponse(
                "👻 *The spirits are silent... (Connection Error)*",
                false,
                e.getMessage()
            );
        }
    }
}

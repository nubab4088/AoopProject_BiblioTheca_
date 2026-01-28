package com.bibliotheca.model;

public class ChatRequest {
    private String message;
    private String conversationHistory;

    public ChatRequest() {}

    public ChatRequest(String message) {
        this.message = message;
    }

    public ChatRequest(String message, String conversationHistory) {
        this.message = message;
        this.conversationHistory = conversationHistory;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getConversationHistory() {
        return conversationHistory;
    }

    public void setConversationHistory(String conversationHistory) {
        this.conversationHistory = conversationHistory;
    }
}

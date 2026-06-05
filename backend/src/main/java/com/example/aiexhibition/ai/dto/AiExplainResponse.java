package com.example.aiexhibition.ai.dto;

public record AiExplainResponse(
        String message,
        Boolean generated
) {
    public AiExplainResponse(String message) {
        this(message, true);
    }
}


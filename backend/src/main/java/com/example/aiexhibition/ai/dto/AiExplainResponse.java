package com.example.aiexhibition.ai.dto;

import org.springframework.lang.NonNull;

public record AiExplainResponse(
        @NonNull String message
) {
}


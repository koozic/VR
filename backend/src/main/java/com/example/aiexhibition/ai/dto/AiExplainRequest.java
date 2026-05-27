package com.example.aiexhibition.ai.dto;

import jakarta.validation.constraints.NotBlank;

public record AiExplainRequest(
        Long artworkId,
        @NotBlank String title,
        String artistName,
        String description
) {
}


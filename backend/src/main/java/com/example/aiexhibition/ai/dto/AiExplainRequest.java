package com.example.aiexhibition.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AiExplainRequest(
        Long artworkId,
        @NotBlank String title,
        String artistName,
        String description,
        @Size(max = 300) String userQuestion
) {
}



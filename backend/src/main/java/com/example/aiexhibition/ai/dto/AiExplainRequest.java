package com.example.aiexhibition.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

public record AiExplainRequest(
        @NonNull @NotNull Long artworkId,
        @NonNull @NotBlank String title,
        @Nullable String artistName,
        @Nullable String description
) {
}


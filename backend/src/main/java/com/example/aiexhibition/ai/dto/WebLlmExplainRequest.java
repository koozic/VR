package com.example.aiexhibition.ai.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Browser-generated WebLLM answer sent back to the backend for response normalization.
 */
public record WebLlmExplainRequest(
        @NotBlank @Size(max = 2000) String message,
        @Size(max = 100) String modelId,
        @Valid LocalAiContext localContext
) {
}

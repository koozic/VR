package com.example.aiexhibition.ai.dto;

import com.example.aiexhibition.ai.AiFailureReason;
import com.example.aiexhibition.ai.AiProvider;
import com.example.aiexhibition.ai.AiResultStatus;
import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Spring Boot가 프런트엔드에 공개하는 AI 설명 결과.
 * generated는 기존 프런트엔드와의 호환성을 위해 유지한다.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record AiExplainResponse(
        String message,
        boolean generated,
        AiResultStatus status,
        AiProvider provider,
        AiFailureReason failureReason,
        LocalAiContext localContext
) {
    public static AiExplainResponse generated(String message) {
        return new AiExplainResponse(
                message,
                true,
                AiResultStatus.GENERATED,
                AiProvider.GEMINI,
                null,
                null
        );
    }

    public static AiExplainResponse webLlmGenerated(String message) {
        return new AiExplainResponse(
                message,
                true,
                AiResultStatus.GENERATED,
                AiProvider.WEB_LLM,
                null,
                null
        );
    }

    public static AiExplainResponse localFallback(
            String message,
            LocalAiContext localContext
    ) {
        return localFallback(message, AiFailureReason.GEMINI_QUOTA_EXHAUSTED, localContext);
    }

    public static AiExplainResponse localFallback(
            String message,
            AiFailureReason failureReason,
            LocalAiContext localContext
    ) {
        return new AiExplainResponse(
                message,
                false,
                AiResultStatus.LOCAL_FALLBACK_REQUIRED,
                null,
                failureReason,
                localContext
        );
    }

    public static AiExplainResponse unavailable(
            String message,
            AiFailureReason failureReason
    ) {
        return new AiExplainResponse(
                message,
                false,
                AiResultStatus.TEMPORARILY_UNAVAILABLE,
                null,
                failureReason,
                null
        );
    }
}


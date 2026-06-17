package com.example.aiexhibition.ai.dto;

import com.example.aiexhibition.ai.AiFailureReason;
import com.example.aiexhibition.ai.AiProvider;
import com.example.aiexhibition.ai.AiResultStatus;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record VoiceDocentQuestionResponse(
        String message,
        boolean generated,
        AiResultStatus status,
        AiProvider provider,
        AiFailureReason failureReason,
        LocalAiContext localContext
) {
    public static VoiceDocentQuestionResponse from(AiExplainResponse response) {
        return new VoiceDocentQuestionResponse(
                response.message(),
                response.generated(),
                response.status(),
                response.provider(),
                response.failureReason(),
                response.localContext()
        );
    }
}

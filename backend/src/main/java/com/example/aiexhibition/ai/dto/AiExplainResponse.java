package com.example.aiexhibition.ai.dto;

/**
 * generated는 message가 실제 AI 생성 결과인지, 장애 시 대체 문구인지 구분한다.
 */
public record AiExplainResponse(
        String message,
        Boolean generated
) {
    public AiExplainResponse(String message) {
        this(message, true);
    }
}


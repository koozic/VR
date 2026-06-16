package com.example.aiexhibition.ai.dto;

/**
 * FastAPI가 성공 상태에서 반환하는 내부 통신 전용 응답.
 */
public record FastApiExplainResponse(
        // FastAPI/Gemini가 만든 최종 설명 문장이다.
        String message
) {
}

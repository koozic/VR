package com.example.aiexhibition.ai.dto;

/**
 * FastAPI가 오류 상태에서 반환하는 내부 통신 전용 응답.
 */
public record FastApiErrorResponse(
        String code,
        String message
) {
}

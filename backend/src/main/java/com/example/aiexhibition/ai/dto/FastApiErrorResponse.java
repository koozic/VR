package com.example.aiexhibition.ai.dto;

/**
 * FastAPI가 오류 상태에서 반환하는 내부 통신 전용 응답.
 */
public record FastApiErrorResponse(
        // FastAPI가 알려주는 오류 코드다. Spring Boot에서 AiFailureReason으로 변환한다.
        String code,
        // 사람이 읽을 수 있는 오류 설명이다.
        String message
) {
}

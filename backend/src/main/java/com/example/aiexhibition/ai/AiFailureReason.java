package com.example.aiexhibition.ai;

import java.util.Locale;

/**
 * FastAPI 또는 Spring Boot의 AI 통신 과정에서 발생한 실패 원인.
 */
public enum AiFailureReason {
    // Gemini 무료 quota/token이 소진되어 브라우저 WebLLM fallback을 시도할 수 있는 상태다.
    GEMINI_QUOTA_EXHAUSTED,
    // Gemini API key가 잘못됐거나 인증에 실패한 상태다.
    GEMINI_AUTH_FAILED,
    // AI 서버 설정값이 잘못되어 요청을 처리할 수 없는 상태다.
    AI_SERVER_CONFIGURATION_ERROR,
    // AI 서버는 응답했지만 실제 설명 생성에 실패한 상태다.
    AI_GENERATION_FAILED,
    // Spring Boot가 FastAPI 응답을 기다리다가 제한 시간을 넘긴 상태다.
    AI_SERVER_TIMEOUT,
    // FastAPI 서버가 꺼져 있거나 네트워크상 접근할 수 없는 상태다.
    AI_SERVER_UNAVAILABLE,
    // 알 수 없는 오류 코드가 들어왔을 때 사용하는 안전한 기본값이다.
    UNKNOWN;

    /**
     * FastAPI가 보낸 오류 코드 문자열을 안전하게 enum으로 변환한다.
     */
    public static AiFailureReason fromExternalCode(String code) {
        if (code == null || code.isBlank()) {
            return UNKNOWN;
        }

        try {
            return valueOf(code.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            return UNKNOWN;
        }
    }
}

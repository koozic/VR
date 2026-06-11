package com.example.aiexhibition.ai;

import java.util.Locale;

/**
 * FastAPI 또는 Spring Boot의 AI 통신 과정에서 발생한 실패 원인.
 */
public enum AiFailureReason {
    GEMINI_QUOTA_EXHAUSTED,
    GEMINI_AUTH_FAILED,
    AI_SERVER_CONFIGURATION_ERROR,
    AI_GENERATION_FAILED,
    AI_SERVER_TIMEOUT,
    AI_SERVER_UNAVAILABLE,
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

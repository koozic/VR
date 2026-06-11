package com.example.aiexhibition.ai;

/**
 * 프런트엔드가 다음 행동을 결정할 수 있도록 구분한 AI 요청 결과.
 */
public enum AiResultStatus {
    GENERATED,
    LOCAL_FALLBACK_REQUIRED,
    TEMPORARILY_UNAVAILABLE
}

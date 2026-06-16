package com.example.aiexhibition.ai;

/**
 * 프런트엔드가 다음 행동을 결정할 수 있도록 구분한 AI 요청 결과.
 */
public enum AiResultStatus {
    // AI 설명이 정상 생성되어 바로 화면에 보여주면 되는 상태다.
    GENERATED,
    // 서버 AI가 quota 등으로 실패해 브라우저 WebLLM 실행이 필요한 상태다.
    LOCAL_FALLBACK_REQUIRED,
    // 일시적인 서버/네트워크 문제로 지금은 설명을 제공할 수 없는 상태다.
    TEMPORARILY_UNAVAILABLE
}

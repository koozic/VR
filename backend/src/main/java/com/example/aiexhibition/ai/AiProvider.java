package com.example.aiexhibition.ai;

/**
 * AI 설명을 실제로 생성한 제공자.
 */
public enum AiProvider {
    // FastAPI를 거쳐 Gemini API가 설명을 생성한 경우다.
    GEMINI,
    // 사용자의 브라우저에서 WebLLM이 로컬로 설명을 생성한 경우다.
    WEB_LLM
}

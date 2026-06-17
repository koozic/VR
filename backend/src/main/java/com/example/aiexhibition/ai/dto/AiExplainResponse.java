package com.example.aiexhibition.ai.dto;

import com.example.aiexhibition.ai.AiFailureReason;
import com.example.aiexhibition.ai.AiProvider;
import com.example.aiexhibition.ai.AiResultStatus;
import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Spring Boot가 프런트엔드에 공개하는 AI 설명 결과.
 * generated는 기존 프런트엔드와의 호환성을 위해 유지한다.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record AiExplainResponse(
        // 프런트엔드 화면에 보여줄 최종 답변 문장이다.
        String message,
        // 예전 프런트엔드가 보던 값이다. 실제 생성 성공 여부를 status와 함께 알려준다.
        boolean generated,
        // 성공, WebLLM 필요, 일시 실패 같은 결과 상태를 enum으로 알려준다.
        AiResultStatus status,
        // 답변을 만든 주체다. Gemini인지 브라우저 WebLLM인지 구분한다.
        AiProvider provider,
        // 실패했을 때 왜 실패했는지 프런트엔드가 분기할 수 있게 알려준다.
        AiFailureReason failureReason,
        // WebLLM fallback이 필요할 때 브라우저로 넘길 작품 정보 묶음이다.
        LocalAiContext localContext
) {
    // FastAPI/Gemini가 정상 답변을 만들었을 때 사용하는 응답이다.
    public static AiExplainResponse generated(String message) {
        return new AiExplainResponse(
                message,
                true,
                AiResultStatus.GENERATED,
                AiProvider.GEMINI,
                null,
                null
        );
    }

    // 브라우저 WebLLM이 만든 답변을 서버 응답 모양으로 맞출 때 사용한다.
    public static AiExplainResponse webLlmGenerated(String message) {
        return new AiExplainResponse(
                message,
                true,
                AiResultStatus.GENERATED,
                AiProvider.WEB_LLM,
                null,
                null
        );
    }

    // Gemini 무료 토큰 소진처럼 브라우저 WebLLM으로 넘길 수 있는 상황의 기본 응답이다.
    public static AiExplainResponse localFallback(
            String message,
            LocalAiContext localContext
    ) {
        return localFallback(message, AiFailureReason.GEMINI_QUOTA_EXHAUSTED, localContext);
    }

    // fallback 사유를 직접 지정해야 할 때 사용하는 응답이다.
    public static AiExplainResponse localFallback(
            String message,
            AiFailureReason failureReason,
            LocalAiContext localContext
    ) {
        return new AiExplainResponse(
                message,
                false,
                AiResultStatus.LOCAL_FALLBACK_REQUIRED,
                null,
                failureReason,
                localContext
        );
    }

    // WebLLM으로도 넘기기 애매한 서버/네트워크 오류일 때 사용하는 응답이다.
    public static AiExplainResponse unavailable(
            String message,
            AiFailureReason failureReason
    ) {
        return new AiExplainResponse(
                message,
                false,
                AiResultStatus.TEMPORARILY_UNAVAILABLE,
                null,
                failureReason,
                null
        );
    }
}


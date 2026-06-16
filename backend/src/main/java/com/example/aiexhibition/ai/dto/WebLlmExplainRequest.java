package com.example.aiexhibition.ai.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 브라우저 WebLLM이 만든 답변을 백엔드 응답 형식으로 정규화하기 위해 보내는 요청 DTO.
 */
public record WebLlmExplainRequest(
        // WebLLM이 최종 생성한 설명 문장이다.
        @NotBlank @Size(max = 2000) String message,
        // 어떤 브라우저 모델이 답변했는지 남길 수 있는 선택 정보다.
        @Size(max = 100) String modelId,
        // fallback을 만들 때 사용했던 작품 문맥이다.
        @Valid LocalAiContext localContext
) {
}

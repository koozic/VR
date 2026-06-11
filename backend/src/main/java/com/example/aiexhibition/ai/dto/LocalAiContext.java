package com.example.aiexhibition.ai.dto;

import java.util.List;

/**
 * 브라우저의 WebLLM이 답변을 만들 때 필요한 검증된 작품 정보.
 */
public record LocalAiContext(
        Long exhibitId,
        String title,
        String creator,
        String description,
        List<String> keywords,
        String exampleText,
        String userQuestion
) {
    public LocalAiContext {
        keywords = keywords == null ? List.of() : List.copyOf(keywords);
    }

    public static LocalAiContext from(AiExplainRequest request) {
        return new LocalAiContext(
                request.exhibitId(),
                request.title(),
                request.creator(),
                request.description(),
                request.keywords(),
                request.exampleText(),
                request.userQuestion()
        );
    }
}

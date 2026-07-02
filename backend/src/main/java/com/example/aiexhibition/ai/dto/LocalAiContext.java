package com.example.aiexhibition.ai.dto;

import java.util.List;

/**
 * 브라우저의 WebLLM이 답변을 만들 때 필요한 검증된 작품 정보.
 */
public record LocalAiContext(
        // 같은 전시관과 작품의 대화만 WebLLM 문맥으로 사용하기 위한 전시관 ID다.
        Long hallId,
        // WebLLM이 어떤 작품을 설명하는지 알 수 있게 하는 작품 ID다.
        Long exhibitId,
        // 작품 제목이다.
        String title,
        // 작가 이름이다.
        String creator,
        // 작품 설명 본문이다.
        String description,
        // 작품을 설명할 때 참고할 키워드 목록이다.
        List<String> keywords,
        // 기존 예시 문장이 있으면 WebLLM 프롬프트 참고자료로 넘긴다.
        String exampleText,
        // 작품별 관람 포인트, FAQ, 세부 인물 정보 같은 보강 문맥이다.
        String docentContext,
        // 관람객이 직접 질문한 내용이다.
        String userQuestion
) {
    // null 키워드가 들어와도 이후 코드가 안전하게 빈 목록으로 다루게 만든다.
    public LocalAiContext {
        keywords = keywords == null ? List.of() : List.copyOf(keywords);
    }

    // 검증과 작품 보강이 끝난 AiExplainRequest에서 WebLLM용 문맥만 뽑아낸다.
    public static LocalAiContext from(AiExplainRequest request) {
        return new LocalAiContext(
                request.hallId(),
                request.exhibitId(),
                request.title(),
                request.creator(),
                request.description(),
                request.keywords(),
                request.exampleText(),
                request.docentContext(),
                request.userQuestion()
        );
    }
}

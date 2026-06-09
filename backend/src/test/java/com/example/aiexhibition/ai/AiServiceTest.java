package com.example.aiexhibition.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.aiexhibition.ai.dto.AiExplainRequest;
import com.example.aiexhibition.ai.dto.AiExplainResponse;
import com.example.aiexhibition.exhibit.ExhibitService;
import com.example.aiexhibition.exhibit.dto.ExhibitResponse;
import com.example.aiexhibition.keyword.ExhibitKeywordService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class AiServiceTest {

    @Test
    void enrichesMissingKeywordsBeforeRequestingFastApi() {
        FastApiClient fastApiClient = org.mockito.Mockito.mock(FastApiClient.class);
        ExhibitService exhibitService = org.mockito.Mockito.mock(ExhibitService.class);
        ExhibitKeywordService keywordService = org.mockito.Mockito.mock(ExhibitKeywordService.class);
        AiService aiService = new AiService(fastApiClient, exhibitService, keywordService);
        AiExplainRequest request = new AiExplainRequest(
                7L,
                "테스트 작품",
                "테스트 작가",
                "테스트 설명입니다.",
                null,
                "테스트 예시문입니다.",
                null,
                null,
                null,
                null
        );

        when(keywordService.findKeywordsByExhibitId(7L))
                .thenReturn(List.of("키워드 A", "키워드 B", "키워드 C"));
        when(fastApiClient.requestExplanation(any()))
                .thenReturn(new AiExplainResponse("생성된 설명입니다."));

        AiExplainResponse response = aiService.explain(request);

        ArgumentCaptor<AiExplainRequest> captor = ArgumentCaptor.forClass(AiExplainRequest.class);
        verify(fastApiClient).requestExplanation(captor.capture());
        assertThat(captor.getValue().keywords())
                .containsExactly("키워드 A", "키워드 B", "키워드 C");
        assertThat(captor.getValue().exampleText())
                .isEqualTo("테스트 예시문입니다.");
        assertThat(response.generated()).isTrue();
    }

    @Test
    void preservesNearestExhibitKeywordsAndExampleText() {
        FastApiClient fastApiClient = org.mockito.Mockito.mock(FastApiClient.class);
        ExhibitService exhibitService = org.mockito.Mockito.mock(ExhibitService.class);
        ExhibitKeywordService keywordService = org.mockito.Mockito.mock(ExhibitKeywordService.class);
        AiService aiService = new AiService(fastApiClient, exhibitService, keywordService);
        AiExplainRequest request = new AiExplainRequest(
                null,
                null,
                null,
                null,
                null,
                null,
                "질문",
                new AiExplainRequest.UserPosition(1.0, 2.0, 3.0),
                1L,
                4.5
        );
        ExhibitResponse nearestExhibit = new ExhibitResponse(
                7L,
                "별이 빛나는 밤",
                "빈센트 반 고흐",
                "작품 설명",
                List.of("소용돌이", "밤하늘", "별빛"),
                "예시 설명문",
                1L,
                1.0,
                2.0,
                3.0,
                "painting",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );

        when(exhibitService.findNearest(1.0, 2.0, 3.0, 1L, 4.5))
                .thenReturn(nearestExhibit);
        when(fastApiClient.requestExplanation(any()))
                .thenReturn(new AiExplainResponse("생성된 설명"));

        aiService.explain(request);

        ArgumentCaptor<AiExplainRequest> captor = ArgumentCaptor.forClass(AiExplainRequest.class);
        verify(fastApiClient).requestExplanation(captor.capture());
        assertThat(captor.getValue().keywords())
                .containsExactly("소용돌이", "밤하늘", "별빛");
        assertThat(captor.getValue().exampleText()).isEqualTo("예시 설명문");
        verify(keywordService, never()).findKeywordsByExhibitId(any());
    }
}

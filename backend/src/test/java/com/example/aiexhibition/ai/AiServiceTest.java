package com.example.aiexhibition.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.aiexhibition.ai.dto.AiExplainRequest;
import com.example.aiexhibition.ai.dto.AiExplainResponse;
import com.example.aiexhibition.exhibit.ExhibitService;
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
}

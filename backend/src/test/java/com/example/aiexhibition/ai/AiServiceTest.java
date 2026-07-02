package com.example.aiexhibition.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.aiexhibition.ai.dto.AiExplainRequest;
import com.example.aiexhibition.ai.dto.AiExplainResponse;
import com.example.aiexhibition.ai.dto.FastApiExplainResponse;
import com.example.aiexhibition.exhibit.ExhibitService;
import com.example.aiexhibition.exhibit.dto.ExhibitResponse;
import com.example.aiexhibition.keyword.ExhibitKeywordService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.ArgumentCaptor;

class AiServiceTest {

    @Test
    void enrichesMissingKeywordsAndReturnsGeminiResult() {
        TestContext context = new TestContext();
        AiExplainRequest request = artworkRequest(null);

        when(context.keywordService.findKeywordsByExhibitId(7L))
                .thenReturn(List.of("키워드 A", "키워드 B", "키워드 C"));
        when(context.fastApiClient.requestExplanation(any()))
                .thenReturn(new FastApiExplainResponse("생성된 설명입니다."));

        AiExplainResponse response = context.aiService.explain(request);

        ArgumentCaptor<AiExplainRequest> captor = ArgumentCaptor.forClass(AiExplainRequest.class);
        verify(context.fastApiClient).requestExplanation(captor.capture());
        assertThat(captor.getValue().keywords())
                .containsExactly("키워드 A", "키워드 B", "키워드 C");
        assertThat(response.generated()).isTrue();
        assertThat(response.status()).isEqualTo(AiResultStatus.GENERATED);
        assertThat(response.provider()).isEqualTo(AiProvider.GEMINI);
        assertThat(response.failureReason()).isNull();
        assertThat(response.localContext()).isNull();
    }

    @Test
    void quotaFailureReturnsLocalFallbackContext() {
        TestContext context = new TestContext();
        AiExplainRequest request = artworkRequest(List.of("밤하늘", "별빛"));

        when(context.fastApiClient.requestExplanation(any()))
                .thenThrow(new FastApiClientException(
                        AiFailureReason.GEMINI_QUOTA_EXHAUSTED,
                        "quota exhausted"
                ));

        AiExplainResponse response = context.aiService.explain(request);

        assertThat(response.generated()).isFalse();
        assertThat(response.status()).isEqualTo(AiResultStatus.LOCAL_FALLBACK_REQUIRED);
        assertThat(response.failureReason()).isEqualTo(AiFailureReason.GEMINI_QUOTA_EXHAUSTED);
        assertThat(response.localContext().exhibitId()).isEqualTo(7L);
        assertThat(response.localContext().title()).isEqualTo("테스트 작품");
        assertThat(response.localContext().keywords()).containsExactly("밤하늘", "별빛");
        assertThat(response.localContext().userQuestion()).isEqualTo("왜 별이 밝나요?");
    }

    @Test
    void generationFailureReturnsLocalFallbackContext() {
        TestContext context = new TestContext();
        AiExplainRequest request = artworkRequest(List.of("밤하늘", "별빛"));

        when(context.fastApiClient.requestExplanation(any()))
                .thenThrow(new FastApiClientException(
                        AiFailureReason.AI_GENERATION_FAILED,
                        "generation failed"
                ));

        AiExplainResponse response = context.aiService.explain(request);

        assertThat(response.generated()).isFalse();
        assertThat(response.status()).isEqualTo(AiResultStatus.LOCAL_FALLBACK_REQUIRED);
        assertThat(response.failureReason()).isEqualTo(AiFailureReason.AI_GENERATION_FAILED);
        assertThat(response.localContext().title()).isEqualTo("테스트 작품");
    }

    @Test
    void quotaFailureUsesNearestExhibitForLocalContext() {
        TestContext context = new TestContext();
        AiExplainRequest request = new AiExplainRequest(
                null,
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
        ExhibitResponse nearestExhibit = nearestExhibit();

        when(context.exhibitService.findNearest(1.0, 2.0, 3.0, 1L, 4.5))
                .thenReturn(nearestExhibit);
        when(context.fastApiClient.requestExplanation(any()))
                .thenThrow(new FastApiClientException(
                        AiFailureReason.GEMINI_QUOTA_EXHAUSTED,
                        "quota exhausted"
                ));

        AiExplainResponse response = context.aiService.explain(request);

        assertThat(response.localContext().exhibitId()).isEqualTo(7L);
        assertThat(response.localContext().title()).isEqualTo("별이 빛나는 밤");
        assertThat(response.localContext().creator()).isEqualTo("빈센트 반 고흐");
        assertThat(response.localContext().keywords())
                .containsExactly("소용돌이", "밤하늘", "별빛");
        assertThat(response.localContext().exampleText()).isEqualTo("예시 설명문");
        assertThat(response.localContext().docentContext())
                .contains("소용돌이치는 붓질");
        assertThat(response.localContext().userQuestion()).isEqualTo("질문");
        verify(context.keywordService, never()).findKeywordsByExhibitId(any());
    }

    @Test
    void idOnlyRequestIsResolvedBeforeCreatingLocalContext() {
        TestContext context = new TestContext();
        AiExplainRequest request = new AiExplainRequest(
                7L,
                null,
                null,
                null,
                null,
                null,
                null,
                "질문",
                null,
                null,
                null
        );

        when(context.exhibitService.findById(7L)).thenReturn(nearestExhibit());
        when(context.fastApiClient.requestExplanation(any()))
                .thenThrow(new FastApiClientException(
                        AiFailureReason.GEMINI_QUOTA_EXHAUSTED,
                        "quota exhausted"
                ));

        AiExplainResponse response = context.aiService.explain(request);

        assertThat(response.localContext().title()).isEqualTo("별이 빛나는 밤");
        assertThat(response.localContext().description()).isEqualTo("작품 설명");
        assertThat(response.localContext().keywords())
                .containsExactly("소용돌이", "밤하늘", "별빛");
        verify(context.exhibitService).findById(7L);
        verify(context.keywordService, never()).findKeywordsByExhibitId(any());
    }

    @ParameterizedTest
    @EnumSource(
            value = AiFailureReason.class,
            names = {
                    "GEMINI_AUTH_FAILED",
                    "AI_SERVER_CONFIGURATION_ERROR",
                    "AI_SERVER_TIMEOUT",
                    "AI_SERVER_UNAVAILABLE",
                    "UNKNOWN"
            }
    )
    void nonQuotaFailureDoesNotExposeLocalContext(AiFailureReason reason) {
        TestContext context = new TestContext();
        AiExplainRequest request = artworkRequest(List.of("키워드"));

        when(context.fastApiClient.requestExplanation(any()))
                .thenThrow(new FastApiClientException(reason, "failed"));

        AiExplainResponse response = context.aiService.explain(request);

        assertThat(response.generated()).isFalse();
        assertThat(response.status()).isEqualTo(AiResultStatus.TEMPORARILY_UNAVAILABLE);
        assertThat(response.failureReason()).isEqualTo(reason);
        assertThat(response.localContext()).isNull();
    }

    @Test
    void emptyFastApiMessageIsGenerationFailure() {
        TestContext context = new TestContext();
        when(context.fastApiClient.requestExplanation(any()))
                .thenReturn(new FastApiExplainResponse(" "));

        AiExplainResponse response = context.aiService.explain(
                artworkRequest(List.of("키워드"))
        );

        assertThat(response.status()).isEqualTo(AiResultStatus.LOCAL_FALLBACK_REQUIRED);
        assertThat(response.failureReason()).isEqualTo(AiFailureReason.AI_GENERATION_FAILED);
        assertThat(response.localContext()).isNotNull();
    }

    private static AiExplainRequest artworkRequest(List<String> keywords) {
        return new AiExplainRequest(
                7L,
                "테스트 작품",
                "테스트 작가",
                "테스트 설명입니다.",
                keywords,
                "테스트 예시문입니다.",
                "{\"focusPoints\":[\"테스트 포인트\"]}",
                "왜 별이 밝나요?",
                null,
                null,
                null
        );
    }

    private static ExhibitResponse nearestExhibit() {
        return new ExhibitResponse(
                7L,
                "별이 빛나는 밤",
                "빈센트 반 고흐",
                "작품 설명",
                List.of("소용돌이", "밤하늘", "별빛"),
                "예시 설명문",
                "{\"focusPoints\":[\"소용돌이치는 붓질\"]}",
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
    }

    private static class TestContext {
        private final FastApiClient fastApiClient =
                org.mockito.Mockito.mock(FastApiClient.class);
        private final ExhibitService exhibitService =
                org.mockito.Mockito.mock(ExhibitService.class);
        private final ExhibitKeywordService keywordService =
                org.mockito.Mockito.mock(ExhibitKeywordService.class);
        private final AiService aiService =
                new AiService(fastApiClient, exhibitService, keywordService);
    }
}

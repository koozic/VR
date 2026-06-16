package com.example.aiexhibition.ai;

import com.example.aiexhibition.ai.dto.AiExplainRequest;
import com.example.aiexhibition.ai.dto.AiExplainResponse;
import com.example.aiexhibition.ai.dto.FastApiExplainResponse;
import com.example.aiexhibition.ai.dto.LocalAiContext;
import com.example.aiexhibition.ai.dto.WebLlmExplainRequest;
import com.example.aiexhibition.exhibit.ExhibitService;
import com.example.aiexhibition.exhibit.dto.ExhibitResponse;
import com.example.aiexhibition.keyword.ExhibitKeywordService;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);
    // FastAPI나 Gemini 자체를 사용할 수 없을 때 프런트엔드에 보여줄 기본 안내 문구다.
    private static final String FALLBACK_MESSAGE = "AI 도슨트 응답을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.";
    // Gemini quota 문제처럼 브라우저 WebLLM으로 이어받을 수 있는 상황에서 내려주는 안내 문구다.
    private static final String LOCAL_FALLBACK_MESSAGE =
            "Gemini 사용량 한도에 도달해 브라우저의 로컬 AI 전환이 필요합니다.";

    // FastAPI 호출, 작품 조회, 키워드 보강을 각각 전담 객체에 위임한다.
    private final FastApiClient fastApiClient;
    private final ExhibitService exhibitService;
    private final ExhibitKeywordService exhibitKeywordService;

    public AiService(
            FastApiClient fastApiClient,
            ExhibitService exhibitService,
            ExhibitKeywordService exhibitKeywordService
    ) {
        this.fastApiClient = fastApiClient;
        this.exhibitService = exhibitService;
        this.exhibitKeywordService = exhibitKeywordService;
    }

    public AiExplainResponse explain(AiExplainRequest request) {
        // 좌표나 ID만 온 요청은 실제 작품 정보까지 채운 뒤 FastAPI로 전달한다.
        AiExplainRequest resolvedRequest = enrichKeywords(resolveExhibit(request));
        FastApiExplainResponse response;
        try {
            // Spring Boot는 AI를 직접 생성하지 않고 FastAPI AI 서버에 생성을 요청한다.
            response = fastApiClient.requestExplanation(resolvedRequest);
        } catch (FastApiClientException ex) {
            log.warn(
                    "AI explanation request failed. reason={} exhibitId={}",
                    ex.getReason(),
                    resolvedRequest.exhibitId()
            );
            log.debug("AI explanation request failure details.", ex);
            if (requiresLocalFallback(ex.getReason())) {
                // quota 초과나 빈 생성 결과는 브라우저 WebLLM으로 이어받을 수 있도록 context를 내려준다.
                return localFallbackResponse(resolvedRequest, ex.getReason());
            }
            // 인증 실패, 서버 장애처럼 로컬 fallback으로도 해결하기 어려운 경우는 unavailable로 응답한다.
            return unavailableResponse(ex.getReason());
        }

        if (response == null || response.message() == null || response.message().isBlank()) {
            log.warn(
                    "FastAPI returned an empty AI explanation. exhibitId={}",
                    resolvedRequest.exhibitId()
            );
            return localFallbackResponse(resolvedRequest, AiFailureReason.AI_GENERATION_FAILED);
        }
        return generatedResponse(response.message());
    }

    public AiExplainResponse acceptWebLlmExplanation(WebLlmExplainRequest request) {
        // 프런트엔드가 만든 WebLLM 답변도 기존 AI 응답 형식과 같은 모양으로 정규화한다.
        return AiExplainResponse.webLlmGenerated(request.message().trim());
    }

    private AiExplainResponse generatedResponse(String message) {
        return AiExplainResponse.generated(message);
    }

    private boolean requiresLocalFallback(AiFailureReason reason) {
        // 사용량 한도나 생성 실패는 사용자의 브라우저에서 다시 시도할 여지가 있다.
        return reason == AiFailureReason.GEMINI_QUOTA_EXHAUSTED
                || reason == AiFailureReason.AI_GENERATION_FAILED;
    }

    private AiExplainResponse localFallbackResponse(
            AiExplainRequest request,
            AiFailureReason reason
    ) {
        return AiExplainResponse.localFallback(
                LOCAL_FALLBACK_MESSAGE,
                reason,
                LocalAiContext.from(request)
        );
    }

    private AiExplainResponse unavailableResponse(AiFailureReason reason) {
        return AiExplainResponse.unavailable(FALLBACK_MESSAGE, reason);
    }

    private AiExplainRequest resolveExhibit(AiExplainRequest request) {
        if (request.userPosition() != null) {
            // 좌표 요청이면 같은 전시관에서 가장 가까운 작품을 찾아 설명 대상으로 바꾼다.
            AiExplainRequest.UserPosition position = request.userPosition();
            ExhibitResponse exhibit = exhibitService.findNearest(
                    position.x(),
                    position.y(),
                    position.z(),
                    request.hallId(),
                    request.maxDistance()
            );
            return withResolvedExhibit(request, exhibit);
        }

        if (request.exhibitId() != null && !hasText(request.title())) {
            // ID만 오고 작품 제목이 없다면 DB에서 작품 상세 정보를 채운다.
            return withResolvedExhibit(
                    request,
                    exhibitService.findById(request.exhibitId())
            );
        }
        return request;
    }

    private AiExplainRequest withResolvedExhibit(
            AiExplainRequest request,
            ExhibitResponse exhibit
    ) {
        // 기존 질문/거리 조건은 유지하고, 작품 정보만 DB 조회 결과로 교체한다.
        return new AiExplainRequest(
                exhibit.id(),
                exhibit.title(),
                exhibit.creator(),
                exhibit.description(),
                exhibit.keywords(),
                exhibit.exampleText(),
                request.userQuestion(),
                null,
                request.hallId(),
                request.maxDistance()
        );
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private AiExplainRequest enrichKeywords(AiExplainRequest request) {
        if (request.exhibitId() == null || (request.keywords() != null && !request.keywords().isEmpty())) {
            return request;
        }

        // 작품 ID는 있지만 키워드가 비어 있으면 AI 프롬프트 품질을 위해 키워드를 추가로 조회한다.
        List<String> keywords = exhibitKeywordService.findKeywordsByExhibitId(request.exhibitId());
        if (keywords.isEmpty()) {
            return request;
        }

        return new AiExplainRequest(
                request.exhibitId(),
                request.title(),
                request.creator(),
                request.description(),
                keywords,
                request.exampleText(),
                request.userQuestion(),
                request.userPosition(),
                request.hallId(),
                request.maxDistance()
        );
    }
}

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
    private static final String FALLBACK_MESSAGE = "AI 도슨트 응답을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.";
    private static final String LOCAL_FALLBACK_MESSAGE =
            "Gemini 사용량 한도에 도달해 브라우저의 로컬 AI 전환이 필요합니다.";

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
        AiExplainRequest resolvedRequest = enrichKeywords(resolveExhibit(request));
        FastApiExplainResponse response;
        try {
            response = fastApiClient.requestExplanation(resolvedRequest);
        } catch (FastApiClientException ex) {
            log.warn(
                    "AI explanation request failed. reason={} exhibitId={}",
                    ex.getReason(),
                    resolvedRequest.exhibitId()
            );
            log.debug("AI explanation request failure details.", ex);
            if (requiresLocalFallback(ex.getReason())) {
                return localFallbackResponse(resolvedRequest, ex.getReason());
            }
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
        return AiExplainResponse.webLlmGenerated(request.message().trim());
    }

    private AiExplainResponse generatedResponse(String message) {
        return AiExplainResponse.generated(message);
    }

    private boolean requiresLocalFallback(AiFailureReason reason) {
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

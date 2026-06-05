package com.example.aiexhibition.ai;

import com.example.aiexhibition.ai.dto.AiExplainRequest;
import com.example.aiexhibition.ai.dto.AiExplainResponse;
import com.example.aiexhibition.exhibit.ExhibitService;
import com.example.aiexhibition.exhibit.dto.ExhibitResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);
    private static final String FALLBACK_MESSAGE = "AI 도슨트 응답을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.";

    private final FastApiClient fastApiClient;
    private final ExhibitService exhibitService;

    public AiService(FastApiClient fastApiClient, ExhibitService exhibitService) {
        this.fastApiClient = fastApiClient;
        this.exhibitService = exhibitService;
    }

    public AiExplainResponse explain(AiExplainRequest request) {
        AiExplainRequest resolvedRequest = resolveNearestExhibit(request);
        AiExplainResponse response;
        try {
            response = fastApiClient.requestExplanation(resolvedRequest);
        } catch (FastApiClientException ex) {
            log.warn("Failed to request AI explanation from FastAPI server.", ex);
            return new AiExplainResponse(FALLBACK_MESSAGE, false);
        }

        if (response == null || response.message() == null || response.message().isBlank()) {
            return new AiExplainResponse(FALLBACK_MESSAGE, false);
        }
        return new AiExplainResponse(response.message(), true);
    }

    private AiExplainRequest resolveNearestExhibit(AiExplainRequest request) {
        if (request.userPosition() == null) {
            return request;
        }

        AiExplainRequest.UserPosition position = request.userPosition();
        ExhibitResponse exhibit = exhibitService.findNearest(
                position.x(),
                position.y(),
                position.z(),
                request.hallId(),
                request.maxDistance()
        );

        return new AiExplainRequest(
                exhibit.id(),
                exhibit.title(),
                exhibit.creator(),
                exhibit.description(),
                request.userQuestion(),
                null,
                request.hallId(),
                request.maxDistance()
        );
    }
}

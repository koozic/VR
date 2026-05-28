package com.example.aiexhibition.ai;

import com.example.aiexhibition.ai.dto.AiExplainRequest;
import com.example.aiexhibition.ai.dto.AiExplainResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final FastApiClient fastApiClient;

    public AiService(FastApiClient fastApiClient) {
        this.fastApiClient = fastApiClient;
    }

    public AiExplainResponse explain(AiExplainRequest request) {
        AiExplainResponse response;
        try {
            response = fastApiClient.requestExplanation(request);
        } catch (FastApiClientException ex) {
            log.warn("Failed to request AI explanation from FastAPI server.", ex);
            return new AiExplainResponse("AI 도슨트 응답을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.");
        }

        if (response == null || response.message() == null || response.message().isBlank()) {
            return new AiExplainResponse("AI 도슨트 응답을 생성하지 못했습니다.");
        }
        return response;
    }
}


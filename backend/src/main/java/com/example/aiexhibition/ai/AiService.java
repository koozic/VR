package com.example.aiexhibition.ai;

import com.example.aiexhibition.ai.dto.AiExplainRequest;
import com.example.aiexhibition.ai.dto.AiExplainResponse;
import org.springframework.stereotype.Service;

@Service
public class AiService {

    private static final String FALLBACK_MESSAGE = "AI 도슨트 응답을 가져오지 못했습니다. 작품 설명을 잠시 후 다시 요청해 주세요.";

    private final FastApiClient fastApiClient;

    public AiService(FastApiClient fastApiClient) {
        this.fastApiClient = fastApiClient;
    }

    public AiExplainResponse explain(AiExplainRequest request) {
        AiExplainResponse response = fastApiClient.requestExplanation(request);
        if (response == null || response.message() == null || response.message().isBlank()) {
            return new AiExplainResponse(FALLBACK_MESSAGE);
        }
        return response;
    }
}

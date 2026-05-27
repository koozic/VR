package com.example.aiexhibition.ai;

import com.example.aiexhibition.ai.dto.AiExplainRequest;
import com.example.aiexhibition.ai.dto.AiExplainResponse;
import org.springframework.stereotype.Service;

@Service
public class AiService {

    private final FastApiClient fastApiClient;

    public AiService(FastApiClient fastApiClient) {
        this.fastApiClient = fastApiClient;
    }

    public AiExplainResponse explain(AiExplainRequest request) {
        AiExplainResponse response = fastApiClient.requestExplanation(request);
        if (response == null || response.message() == null || response.message().isBlank()) {
            return new AiExplainResponse("AI 도슨트 응답을 생성하지 못했습니다.");
        }
        return response;
    }
}


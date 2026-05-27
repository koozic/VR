package com.example.aiexhibition.ai;

import com.example.aiexhibition.ai.dto.AiExplainRequest;
import com.example.aiexhibition.ai.dto.AiExplainResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class FastApiClient {

    private final WebClient fastApiWebClient;

    public FastApiClient(WebClient fastApiWebClient) {
        this.fastApiWebClient = fastApiWebClient;
    }

    public AiExplainResponse requestExplanation(AiExplainRequest request) {
        return fastApiWebClient.post()
                .uri("/ai/explain")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(AiExplainResponse.class)
                .block();
    }
}


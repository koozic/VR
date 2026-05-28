package com.example.aiexhibition.ai;

import com.example.aiexhibition.ai.dto.AiExplainRequest;
import com.example.aiexhibition.ai.dto.AiExplainResponse;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class FastApiClient {

    private final WebClient fastApiWebClient;

    public FastApiClient(@NonNull WebClient fastApiWebClient) {
        this.fastApiWebClient = fastApiWebClient;
    }

    @Nullable
    public AiExplainResponse requestExplanation(@NonNull AiExplainRequest request) {
        return fastApiWebClient.post()
                .uri("/ai/explain")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(AiExplainResponse.class)
                .block();
    }
}


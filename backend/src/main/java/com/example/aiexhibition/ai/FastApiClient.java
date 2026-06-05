package com.example.aiexhibition.ai;

import com.example.aiexhibition.ai.dto.AiExplainRequest;
import com.example.aiexhibition.ai.dto.AiExplainResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientException;

import java.time.Duration;

@Component
public class FastApiClient {

    private static final Logger log = LoggerFactory.getLogger(FastApiClient.class);

    private final WebClient fastApiWebClient;
    private final Duration requestTimeout;

    public FastApiClient(
            WebClient fastApiWebClient,
            @Value("${app.ai-server.timeout-seconds:10}") long timeoutSeconds
    ) {
        this.fastApiWebClient = fastApiWebClient;
        this.requestTimeout = Duration.ofSeconds(timeoutSeconds);
    }

    public AiExplainResponse requestExplanation(AiExplainRequest request) {
        try {
            return fastApiWebClient.post()
                    .uri("/ai/explain")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(AiExplainResponse.class)
                    .block(requestTimeout);
        } catch (WebClientException | IllegalStateException exception) {
            log.warn("Failed to request AI explanation from FastAPI server", exception);
            return null;
        }
    }
}


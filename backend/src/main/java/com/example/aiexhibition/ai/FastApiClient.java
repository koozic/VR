package com.example.aiexhibition.ai;

import com.example.aiexhibition.ai.dto.AiExplainRequest;
import com.example.aiexhibition.ai.dto.AiExplainResponse;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
public class FastApiClient {

    private static final Logger log = LoggerFactory.getLogger(FastApiClient.class);
    private static final Duration AI_SERVER_TIMEOUT = Duration.ofSeconds(40);

    private final WebClient fastApiWebClient;

    public FastApiClient(WebClient fastApiWebClient) {
        this.fastApiWebClient = fastApiWebClient;
    }

    public AiExplainResponse requestExplanation(AiExplainRequest request) {
        try {
            return fastApiWebClient.post()
                    .uri("/ai/explain")
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, response ->
                            response.bodyToMono(String.class)
                                    .defaultIfEmpty("")
                                    .flatMap(body -> {
                                        log.warn(
                                                "FastAPI AI server returned an error. status={} body={}",
                                                response.statusCode(),
                                                truncate(body)
                                        );
                                        return Mono.error(new FastApiClientException(
                                                "FastAPI AI server returned " + response.statusCode()
                                        ));
                                    })
                    )
                    .bodyToMono(AiExplainResponse.class)
                    .block(AI_SERVER_TIMEOUT);
        } catch (FastApiClientException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            throw new FastApiClientException("FastAPI AI server request failed.", ex);
        }
    }

    private static String truncate(String value) {
        if (value == null || value.length() <= 500) {
            return value;
        }
        return value.substring(0, 500);
    }
}

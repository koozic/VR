package com.example.aiexhibition.ai;

import com.example.aiexhibition.ai.dto.AiExplainRequest;
import com.example.aiexhibition.ai.dto.FastApiErrorResponse;
import com.example.aiexhibition.ai.dto.FastApiExplainResponse;
import java.time.Duration;
import java.util.concurrent.TimeoutException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import reactor.core.Exceptions;
import reactor.core.publisher.Mono;

@Component
public class FastApiClient {

    private static final Logger log = LoggerFactory.getLogger(FastApiClient.class);

    private final WebClient fastApiWebClient;
    private final Duration requestTimeout;

    public FastApiClient(
            WebClient fastApiWebClient,
            @Value("${app.ai-server.timeout-seconds:40}") long timeoutSeconds
    ) {
        this(fastApiWebClient, Duration.ofSeconds(timeoutSeconds));
    }

    FastApiClient(WebClient fastApiWebClient, Duration requestTimeout) {
        if (requestTimeout.isZero() || requestTimeout.isNegative()) {
            throw new IllegalArgumentException("FastAPI request timeout must be greater than 0.");
        }
        this.fastApiWebClient = fastApiWebClient;
        this.requestTimeout = requestTimeout;
    }

    public FastApiExplainResponse requestExplanation(AiExplainRequest request) {
        try {
            return fastApiWebClient.post()
                    .uri("/ai/explain")
                    .bodyValue(request)
                    .exchangeToMono(this::decodeResponse)
                    .timeout(requestTimeout)
                    .block();
        } catch (FastApiClientException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            Throwable cause = Exceptions.unwrap(ex);
            if (cause instanceof TimeoutException) {
                throw new FastApiClientException(
                        AiFailureReason.AI_SERVER_TIMEOUT,
                        "FastAPI AI server request timed out.",
                        ex
                );
            }
            if (cause instanceof WebClientRequestException) {
                throw new FastApiClientException(
                        AiFailureReason.AI_SERVER_UNAVAILABLE,
                        "FastAPI AI server is unavailable.",
                        ex
                );
            }
            throw new FastApiClientException(
                    AiFailureReason.UNKNOWN,
                    "Unexpected FastAPI AI server client failure.",
                    ex
            );
        }
    }

    private Mono<FastApiExplainResponse> decodeResponse(ClientResponse response) {
        if (response.statusCode().is2xxSuccessful()) {
            return response.bodyToMono(FastApiExplainResponse.class);
        }

        HttpStatusCode statusCode = response.statusCode();
        return response.bodyToMono(FastApiErrorResponse.class)
                .onErrorResume(error -> {
                    log.warn(
                            "Failed to decode FastAPI error response. status={}",
                            statusCode,
                            error
                    );
                    return Mono.just(new FastApiErrorResponse(null, null));
                })
                .defaultIfEmpty(new FastApiErrorResponse(null, null))
                .flatMap(errorResponse -> {
                    AiFailureReason reason = resolveFailureReason(
                            statusCode,
                            errorResponse.code()
                    );
                    log.warn(
                            "FastAPI AI server returned an error. status={} code={} reason={}",
                            statusCode,
                            errorResponse.code(),
                            reason
                    );
                    return Mono.error(new FastApiClientException(
                            reason,
                            errorMessage(errorResponse, statusCode)
                    ));
                });
    }

    private static AiFailureReason resolveFailureReason(
            HttpStatusCode statusCode,
            String externalCode
    ) {
        AiFailureReason mappedReason = AiFailureReason.fromExternalCode(externalCode);
        if (mappedReason != AiFailureReason.UNKNOWN) {
            return mappedReason;
        }
        if (statusCode.value() == 429) {
            return AiFailureReason.GEMINI_QUOTA_EXHAUSTED;
        }
        if (statusCode.value() == 502) {
            return AiFailureReason.AI_GENERATION_FAILED;
        }
        return AiFailureReason.UNKNOWN;
    }

    private static String errorMessage(
            FastApiErrorResponse response,
            HttpStatusCode statusCode
    ) {
        if (response.message() != null && !response.message().isBlank()) {
            return response.message();
        }
        return "FastAPI AI server returned " + statusCode;
    }
}

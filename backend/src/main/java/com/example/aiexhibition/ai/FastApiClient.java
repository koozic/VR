package com.example.aiexhibition.ai;

import com.example.aiexhibition.ai.dto.AiExplainRequest;
import com.example.aiexhibition.ai.dto.FastApiErrorResponse;
import com.example.aiexhibition.ai.dto.FastApiExplainResponse;
import java.time.Duration;
import java.util.concurrent.TimeoutException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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

    // WebClient는 FastAPI 서버로 HTTP 요청을 보내는 Spring의 비동기 HTTP 클라이언트다.
    private final WebClient fastApiWebClient;
    // 외부 AI 서버가 너무 오래 응답하지 않으면 요청을 끊기 위한 제한 시간이다.
    private final Duration requestTimeout;

    @Autowired
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
        return postExplanation("/ai/explain", request);
    }

    public FastApiExplainResponse requestVoiceDocentQuestionAnswer(AiExplainRequest request) {
        return postExplanation("/ai/voice-docent-question", request);
    }

    private FastApiExplainResponse postExplanation(String uri, AiExplainRequest request) {
        try {
            // POST /ai/explain으로 요청 DTO를 보내고, 성공/실패 응답을 decodeResponse에서 분기한다.
            return fastApiWebClient.post()
                    .uri(uri)
                    .bodyValue(request)
                    .exchangeToMono(this::decodeResponse)
                    .timeout(requestTimeout)
                    .block();
        } catch (FastApiClientException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            // Reactor/WebClient가 감싼 예외를 실제 원인으로 풀어 실패 이유 enum에 매핑한다.
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
            // 2xx 응답이면 FastAPI 성공 DTO로 변환한다.
            return response.bodyToMono(FastApiExplainResponse.class);
        }

        // 오류 응답이면 FastAPI가 내려준 code/message를 읽어 Spring Boot 표준 실패 이유로 바꾼다.
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
        // FastAPI가 명시적으로 보낸 오류 코드가 있으면 그 값을 우선한다.
        AiFailureReason mappedReason = AiFailureReason.fromExternalCode(externalCode);
        if (mappedReason != AiFailureReason.UNKNOWN) {
            return mappedReason;
        }
        if (statusCode.value() == 429) {
            // 429는 일반적으로 quota/rate limit 계열이므로 Gemini 사용량 초과로 해석한다.
            return AiFailureReason.GEMINI_QUOTA_EXHAUSTED;
        }
        if (statusCode.value() == 502) {
            // 502는 AI 서버가 외부 생성 모델 호출에 실패한 상황으로 본다.
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

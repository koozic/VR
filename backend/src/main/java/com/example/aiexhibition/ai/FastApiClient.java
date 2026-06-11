package com.example.aiexhibition.ai;

import com.example.aiexhibition.ai.dto.AiExplainRequest;
import com.example.aiexhibition.ai.dto.AiExplainResponse;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
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
        this.fastApiWebClient = fastApiWebClient;
        this.requestTimeout = Duration.ofSeconds(timeoutSeconds);
    }

    public AiExplainResponse requestExplanation(AiExplainRequest request) {
        try {
            // 설정된 base-url 뒤에 /ai/explain을 붙여 FastAPI로 POST 요청을 보낸다.
            return fastApiWebClient.post()
                    .uri("/ai/explain")
                    .bodyValue(request)
                    .retrieve()
                    // 4xx/5xx 응답 본문은 로그에 일부만 남기고 공통 예외로 변환한다.
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
                    // JSON 응답을 AiExplainResponse로 역직렬화한다.
                    .bodyToMono(AiExplainResponse.class)
                    // WebClient는 비동기 클라이언트지만 현재 서비스는 동기 MVC이므로
                    // 설정된 제한 시간까지만 현재 요청 스레드에서 결과를 기다린다.
                    .block(requestTimeout);
        } catch (FastApiClientException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            throw new FastApiClientException("FastAPI AI server request failed.", ex);
        }
    }

    private static String truncate(String value) {
        // 외부 서버가 긴 오류 본문을 보내도 로그가 과도하게 커지지 않도록 제한한다.
        if (value == null || value.length() <= 500) {
            return value;
        }
        return value.substring(0, 500);
    }
}

package com.example.aiexhibition.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;

import com.example.aiexhibition.ai.dto.AiExplainRequest;
import com.example.aiexhibition.ai.dto.FastApiExplainResponse;
import java.net.ConnectException;
import java.net.URI;
import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.ExchangeFunction;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import reactor.core.publisher.Mono;

class FastApiClientTest {

    @Test
    void decodesSuccessfulFastApiResponseIntoInternalDto() {
        FastApiClient client = clientResponding(
                HttpStatus.OK,
                "{\"message\":\"생성된 설명\"}"
        );

        FastApiExplainResponse response = client.requestExplanation(request());

        assertThat(response.message()).isEqualTo("생성된 설명");
    }

    @Test
    void mapsFastApiQuotaCodeToFailureReason() {
        FastApiClient client = clientResponding(
                HttpStatus.TOO_MANY_REQUESTS,
                """
                {
                  "code": "GEMINI_QUOTA_EXHAUSTED",
                  "message": "Gemini 무료 할당량을 모두 사용했습니다."
                }
                """
        );

        FastApiClientException exception = catchThrowableOfType(
                () -> client.requestExplanation(request()),
                FastApiClientException.class
        );

        assertThat(exception.getReason())
                .isEqualTo(AiFailureReason.GEMINI_QUOTA_EXHAUSTED);
    }

    @Test
    void unknownFastApiCodeDoesNotBreakErrorHandling() {
        FastApiClient client = clientResponding(
                HttpStatus.SERVICE_UNAVAILABLE,
                "{\"code\":\"NEW_PROVIDER_ERROR\",\"message\":\"new error\"}"
        );

        FastApiClientException exception = catchThrowableOfType(
                () -> client.requestExplanation(request()),
                FastApiClientException.class
        );

        assertThat(exception.getReason()).isEqualTo(AiFailureReason.UNKNOWN);
    }

    @Test
    void mapsRequestTimeout() {
        ExchangeFunction exchangeFunction = ignored -> Mono.never();
        FastApiClient client = new FastApiClient(
                WebClient.builder().exchangeFunction(exchangeFunction).build(),
                Duration.ofMillis(10)
        );

        FastApiClientException exception = catchThrowableOfType(
                () -> client.requestExplanation(request()),
                FastApiClientException.class
        );

        assertThat(exception.getReason()).isEqualTo(AiFailureReason.AI_SERVER_TIMEOUT);
    }

    @Test
    void mapsConnectionFailure() {
        WebClientRequestException connectionError = new WebClientRequestException(
                new ConnectException("connection refused"),
                HttpMethod.POST,
                URI.create("http://localhost:8010/ai/explain"),
                HttpHeaders.EMPTY
        );
        ExchangeFunction exchangeFunction = ignored -> Mono.error(connectionError);
        FastApiClient client = new FastApiClient(
                WebClient.builder().exchangeFunction(exchangeFunction).build(),
                Duration.ofSeconds(1)
        );

        FastApiClientException exception = catchThrowableOfType(
                () -> client.requestExplanation(request()),
                FastApiClientException.class
        );

        assertThat(exception.getReason()).isEqualTo(AiFailureReason.AI_SERVER_UNAVAILABLE);
    }

    private static FastApiClient clientResponding(HttpStatus status, String body) {
        ExchangeFunction exchangeFunction = ignored -> Mono.just(
                ClientResponse.create(status)
                        .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                        .body(body)
                        .build()
        );
        return new FastApiClient(
                WebClient.builder().exchangeFunction(exchangeFunction).build(),
                Duration.ofSeconds(1)
        );
    }

    private static AiExplainRequest request() {
        return new AiExplainRequest(
                7L,
                "테스트 작품",
                "테스트 작가",
                "테스트 설명",
                List.of("키워드"),
                null,
                null,
                null,
                null,
                null
        );
    }
}

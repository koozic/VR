package com.example.aiexhibition.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * 외부 HTTP 호출 도구인 WebClient를 스프링 빈으로 미리 준비한다.
 */
@Configuration
public class WebClientConfig {

    // FastAPI AI 서버로 요청을 보낼 때 사용할 전용 WebClient다.
    @Bean
    public WebClient fastApiWebClient(
            WebClient.Builder builder,
            // application.yml의 app.ai-server.base-url 값을 읽어온다.
            @Value("${app.ai-server.base-url}") String aiServerBaseUrl
    ) {
        // FastApiClient가 매 요청마다 전체 주소를 만들지 않도록 공통 base URL을 등록한다.
        return builder.baseUrl(aiServerBaseUrl).build();
    }
}


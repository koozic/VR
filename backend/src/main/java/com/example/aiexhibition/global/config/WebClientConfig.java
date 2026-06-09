package com.example.aiexhibition.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient fastApiWebClient(
            WebClient.Builder builder,
            @Value("${app.ai-server.base-url}") String aiServerBaseUrl
    ) {
        // FastApiClient가 매 요청마다 전체 주소를 만들지 않도록 공통 base URL을 등록한다.
        return builder.baseUrl(aiServerBaseUrl).build();
    }
}


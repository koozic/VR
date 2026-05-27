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
        return builder.baseUrl(aiServerBaseUrl).build();
    }
}


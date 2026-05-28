package com.example.aiexhibition.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Objects;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient fastApiWebClient(
            @NonNull WebClient.Builder builder,
            @NonNull @Value("${app.ai-server.base-url}") String aiServerBaseUrl
    ) {
        return builder.baseUrl(Objects.requireNonNull(aiServerBaseUrl)).build();
    }
}


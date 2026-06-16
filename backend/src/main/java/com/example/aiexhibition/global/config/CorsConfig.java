package com.example.aiexhibition.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

/**
 * 브라우저가 다른 주소의 백엔드 API를 호출할 수 있도록 CORS 규칙을 등록한다.
 */
@Configuration
public class CorsConfig {

    // yml에 적은 허용 프런트엔드 주소 목록을 주입받는다.
    private final AllowedOriginProperties allowedOriginProperties;

    public CorsConfig(AllowedOriginProperties allowedOriginProperties) {
        this.allowedOriginProperties = allowedOriginProperties;
    }

    // /api/** 요청에 대해 허용 origin, HTTP 메서드, 헤더 규칙을 적용하는 필터다.
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration configuration = new CorsConfiguration();
        // localhost와 학원 내부 IP처럼 설정 파일에 적은 프런트 주소만 허용한다.
        configuration.setAllowedOriginPatterns(allowedOriginProperties.getPatterns());
        // 프런트엔드가 REST API에서 사용할 수 있는 HTTP 동작들이다.
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        // Authorization, Content-Type 등 필요한 요청 헤더를 폭넓게 허용한다.
        configuration.setAllowedHeaders(List.of("*"));
        // 쿠키/인증정보를 포함한 요청도 받을 수 있게 한다.
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // WebSocket은 별도 설정에서 처리하고, 여기서는 REST API 경로만 다룬다.
        source.registerCorsConfiguration("/api/**", configuration);
        return new CorsFilter(source);
    }
}


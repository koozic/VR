package com.example.aiexhibition.global.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * application.yml의 app.allowed-origins.patterns 값을 자바 객체로 읽어오는 설정 클래스다.
 */
@Component
@ConfigurationProperties(prefix = "app.allowed-origins")
public class AllowedOriginProperties {

    // 프런트엔드 주소 패턴 목록이다. 예: http://localhost:5173, http://10.*.*.*:5173
    private List<String> patterns = List.of();

    // CORS 설정과 WebSocket 설정에서 허용 주소 목록을 읽을 때 사용한다.
    public List<String> getPatterns() {
        return patterns;
    }

    // 설정값이 비어 있어도 null 대신 빈 목록을 저장해 NullPointerException을 피한다.
    public void setPatterns(List<String> patterns) {
        if (patterns == null || patterns.isEmpty()) {
            this.patterns = List.of();
            return;
        }
        this.patterns = List.copyOf(patterns);
    }

    // WebSocket의 setAllowedOriginPatterns가 배열을 요구해서 List를 배열로 바꿔준다.
    public String[] toArray() {
        return patterns.toArray(String[]::new);
    }
}

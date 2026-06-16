package com.example.aiexhibition.global.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.allowed-origins")
public class AllowedOriginProperties {

    private List<String> patterns = List.of();

    public List<String> getPatterns() {
        return patterns;
    }

    public void setPatterns(List<String> patterns) {
        if (patterns == null || patterns.isEmpty()) {
            this.patterns = List.of();
            return;
        }
        this.patterns = List.copyOf(patterns);
    }

    public String[] toArray() {
        return patterns.toArray(String[]::new);
    }
}

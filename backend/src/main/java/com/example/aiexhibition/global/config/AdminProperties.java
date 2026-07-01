package com.example.aiexhibition.global.config;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Minimal password setting for the exhibit admin tools.
 * This is a lightweight classroom/demo guard, not a full account system.
 */
@Component
@ConfigurationProperties(prefix = "app.admin")
public class AdminProperties {

    private String password = "";

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password == null ? "" : password;
    }

    public boolean isEnabled() {
        return password != null && !password.isBlank();
    }

    public boolean matches(String candidate) {
        if (!isEnabled() || candidate == null) {
            return false;
        }
        byte[] expected = password.getBytes(StandardCharsets.UTF_8);
        byte[] actual = candidate.getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(expected, actual);
    }
}

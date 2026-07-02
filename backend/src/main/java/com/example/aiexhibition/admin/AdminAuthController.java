package com.example.aiexhibition.admin;

import com.example.aiexhibition.global.config.AdminAuthInterceptor;
import com.example.aiexhibition.global.config.AdminProperties;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Verifies the admin password before the frontend opens the admin editor.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminAuthController {

    private final AdminProperties adminProperties;

    public AdminAuthController(AdminProperties adminProperties) {
        this.adminProperties = adminProperties;
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(
            @RequestHeader(value = AdminAuthInterceptor.ADMIN_PASSWORD_HEADER, required = false) String password
    ) {
        if (!adminProperties.isEnabled() || adminProperties.matches(password)) {
            return ResponseEntity.ok(Map.<String, Object>of("authenticated", true));
        }

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.<String, Object>of("message", "Invalid admin password."));
    }
}

package com.example.aiexhibition.global.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Protects admin-only mutation APIs with a simple password header.
 */
@Component
public class AdminAuthInterceptor implements HandlerInterceptor {

    public static final String ADMIN_PASSWORD_HEADER = "X-Admin-Password";

    private static final Set<String> MUTATION_METHODS = Set.of("POST", "PUT", "PATCH", "DELETE");

    private final AdminProperties adminProperties;

    public AdminAuthInterceptor(AdminProperties adminProperties) {
        this.adminProperties = adminProperties;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException {
        if (!requiresAdmin(request) || !adminProperties.isEnabled()) {
            return true;
        }

        String suppliedPassword = request.getHeader(ADMIN_PASSWORD_HEADER);
        if (adminProperties.matches(suppliedPassword)) {
            return true;
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"message\":\"Admin password is required.\"}");
        return false;
    }

    private static boolean requiresAdmin(HttpServletRequest request) {
        if (!MUTATION_METHODS.contains(request.getMethod())) {
            return false;
        }

        String path = request.getRequestURI();
        return path.equals("/api/uploads")
                || path.equals("/api/exhibits")
                || path.startsWith("/api/exhibits/")
                || path.equals("/api/artworks")
                || path.startsWith("/api/artworks/");
    }
}

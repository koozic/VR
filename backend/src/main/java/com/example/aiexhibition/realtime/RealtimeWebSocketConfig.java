package com.example.aiexhibition.realtime;

import com.example.aiexhibition.global.config.AllowedOriginProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class RealtimeWebSocketConfig implements WebSocketConfigurer {

    private final GalleryPresenceWebSocketHandler galleryPresenceWebSocketHandler;
    private final AllowedOriginProperties allowedOriginProperties;

    public RealtimeWebSocketConfig(
            GalleryPresenceWebSocketHandler galleryPresenceWebSocketHandler,
            AllowedOriginProperties allowedOriginProperties
    ) {
        this.galleryPresenceWebSocketHandler = galleryPresenceWebSocketHandler;
        this.allowedOriginProperties = allowedOriginProperties;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(galleryPresenceWebSocketHandler, "/ws/gallery")
                .setAllowedOriginPatterns(allowedOriginProperties.toArray());
    }
}

package com.example.aiexhibition.realtime;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class RealtimeWebSocketConfig implements WebSocketConfigurer {

    private final GalleryPresenceWebSocketHandler galleryPresenceWebSocketHandler;

    public RealtimeWebSocketConfig(GalleryPresenceWebSocketHandler galleryPresenceWebSocketHandler) {
        this.galleryPresenceWebSocketHandler = galleryPresenceWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(galleryPresenceWebSocketHandler, "/ws/gallery")
                .setAllowedOrigins(
                        "http://localhost:5173",
                        "http://127.0.0.1:5173",
                        "http://localhost:3000",
                        "http://127.0.0.1:3000"
                );
    }
}

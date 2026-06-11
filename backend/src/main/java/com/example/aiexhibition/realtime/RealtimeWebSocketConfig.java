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
        // 프런트엔드는 /ws/gallery로 접속하며 개발용 localhost와 사설망 Origin을 허용한다.
        registry.addHandler(galleryPresenceWebSocketHandler, "/ws/gallery")
                .setAllowedOriginPatterns(
                        "http://localhost:*",
                        "https://localhost:*",
                        "http://127.0.0.1:*",
                        "https://127.0.0.1:*",
                        "http://10.*:*",
                        "https://10.*:*",
                        "http://172.16.*:*",
                        "https://172.16.*:*",
                        "http://172.17.*:*",
                        "https://172.17.*:*",
                        "http://172.18.*:*",
                        "https://172.18.*:*",
                        "http://172.19.*:*",
                        "https://172.19.*:*",
                        "http://172.20.*:*",
                        "https://172.20.*:*",
                        "http://172.21.*:*",
                        "https://172.21.*:*",
                        "http://172.22.*:*",
                        "https://172.22.*:*",
                        "http://172.23.*:*",
                        "https://172.23.*:*",
                        "http://172.24.*:*",
                        "https://172.24.*:*",
                        "http://172.25.*:*",
                        "https://172.25.*:*",
                        "http://172.26.*:*",
                        "https://172.26.*:*",
                        "http://172.27.*:*",
                        "https://172.27.*:*",
                        "http://172.28.*:*",
                        "https://172.28.*:*",
                        "http://172.29.*:*",
                        "https://172.29.*:*",
                        "http://172.30.*:*",
                        "https://172.30.*:*",
                        "http://172.31.*:*",
                        "https://172.31.*:*",
                        "http://192.168.*:*",
                        "https://192.168.*:*"
                );
    }
}

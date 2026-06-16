package com.example.aiexhibition.realtime;

import com.example.aiexhibition.global.config.AllowedOriginProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * 프런트엔드가 /ws/gallery 주소로 WebSocket 연결을 열 수 있게 등록하는 설정 클래스다.
 */
@Configuration
@EnableWebSocket
public class RealtimeWebSocketConfig implements WebSocketConfigurer {

    // 실제 WebSocket 메시지를 처리하는 담당 객체다.
    private final GalleryPresenceWebSocketHandler galleryPresenceWebSocketHandler;
    // REST CORS와 같은 origin 허용 목록을 WebSocket에도 적용하기 위해 사용한다.
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
        // /ws/gallery로 들어온 연결을 GalleryPresenceWebSocketHandler에게 맡긴다.
        registry.addHandler(galleryPresenceWebSocketHandler, "/ws/gallery")
                // 허용된 프런트엔드 주소에서만 WebSocket 연결을 받을 수 있게 제한한다.
                .setAllowedOriginPatterns(allowedOriginProperties.toArray());
    }
}

package com.example.aiexhibition.realtime;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class GalleryPresenceWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(GalleryPresenceWebSocketHandler.class);

    private final ObjectMapper objectMapper;
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, VisitorPresence> visitors = new ConcurrentHashMap<>();

    public GalleryPresenceWebSocketHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws IOException {
        String userId = "visitor-" + session.getId();
        VisitorPresence visitor = VisitorPresence.initial(userId);
        sessions.put(session.getId(), session);
        visitors.put(session.getId(), visitor);

        send(session, Map.of(
                "type", "WELCOME",
                "userId", userId,
                "users", visitorsInHall(visitor.hallId(), session.getId())
        ));
        broadcastToHall(visitor.hallId(), session.getId(), Map.of(
                "type", "USER_JOINED",
                "user", visitor
        ));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        JsonNode root = parseMessage(message);
        if (root == null) {
            send(session, Map.of("type", "ERROR", "message", "Invalid JSON message."));
            return;
        }

        String type = root.path("type").asText("");
        if ("SIGNAL".equals(type)) {
            relaySignal(session, root);
            return;
        }

        if ("VOICE_READY".equals(type)) {
            VisitorPresence sender = visitors.get(session.getId());
            if (sender != null) {
                broadcastToHall(sender.hallId(), session.getId(), Map.of(
                        "type", "VOICE_READY",
                        "fromUserId", sender.userId()
                ));
            }
            return;
        }

        if (!"JOIN".equals(type) && !"MOVE".equals(type)) {
            send(session, Map.of("type", "ERROR", "message", "Unsupported message type."));
            return;
        }

        VisitorPresence previous = visitors.getOrDefault(session.getId(), VisitorPresence.initial("visitor-" + session.getId()));
        VisitorPresence updated = previous.merge(root);
        visitors.put(session.getId(), updated);

        if (!Objects.equals(previous.hallId(), updated.hallId())) {
            broadcastToHall(previous.hallId(), session.getId(), Map.of(
                    "type", "USER_LEFT",
                    "userId", updated.userId()
            ));
            send(session, Map.of(
                    "type", "WELCOME",
                    "userId", updated.userId(),
                    "users", visitorsInHall(updated.hallId(), session.getId())
            ));
            broadcastToHall(updated.hallId(), session.getId(), Map.of(
                    "type", "USER_JOINED",
                    "user", updated
            ));
            return;
        }

        if ("JOIN".equals(type)) {
            send(session, Map.of(
                    "type", "WELCOME",
                    "userId", updated.userId(),
                    "users", visitorsInHall(updated.hallId(), session.getId())
            ));
            return;
        }

        broadcastToHall(updated.hallId(), session.getId(), Map.of(
                "type", "USER_MOVED",
                "user", updated
        ));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws IOException {
        sessions.remove(session.getId());
        VisitorPresence visitor = visitors.remove(session.getId());
        if (visitor != null) {
            broadcastToHall(visitor.hallId(), session.getId(), Map.of(
                    "type", "USER_LEFT",
                    "userId", visitor.userId()
            ));
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.warn("Gallery websocket transport error. session={}", session.getId(), exception);
        session.close(CloseStatus.SERVER_ERROR);
    }

    private JsonNode parseMessage(TextMessage message) {
        try {
            return objectMapper.readTree(message.getPayload());
        } catch (JsonProcessingException ex) {
            return null;
        }
    }

    private List<VisitorPresence> visitorsInHall(Long hallId, String excludedSessionId) {
        return visitors.entrySet().stream()
                .filter(entry -> !entry.getKey().equals(excludedSessionId))
                .map(Map.Entry::getValue)
                .filter(visitor -> Objects.equals(visitor.hallId(), hallId))
                .toList();
    }

    private void relaySignal(WebSocketSession senderSession, JsonNode root) throws IOException {
        VisitorPresence sender = visitors.get(senderSession.getId());
        if (sender == null) {
            send(senderSession, Map.of("type", "ERROR", "message", "Sender is not registered."));
            return;
        }

        String targetUserId = root.path("targetUserId").asText("");
        JsonNode signal = root.get("signal");
        if (targetUserId.isBlank() || signal == null || signal.isNull()) {
            send(senderSession, Map.of("type", "ERROR", "message", "Invalid signaling message."));
            return;
        }

        WebSocketSession targetSession = sessions.entrySet().stream()
                .filter(entry -> {
                    VisitorPresence visitor = visitors.get(entry.getKey());
                    return visitor != null
                            && Objects.equals(visitor.userId(), targetUserId)
                            && Objects.equals(visitor.hallId(), sender.hallId());
                })
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse(null);

        if (targetSession == null || !targetSession.isOpen()) {
            send(senderSession, Map.of("type", "ERROR", "message", "Target user is not connected."));
            return;
        }

        send(targetSession, Map.of(
                "type", "SIGNAL",
                "fromUserId", sender.userId(),
                "signal", signal
        ));
    }

    private void broadcastToHall(Long hallId, String senderSessionId, Object payload) throws IOException {
        for (Map.Entry<String, VisitorPresence> entry : visitors.entrySet()) {
            if (entry.getKey().equals(senderSessionId) || !Objects.equals(entry.getValue().hallId(), hallId)) {
                continue;
            }
            WebSocketSession session = sessions.get(entry.getKey());
            if (session != null && session.isOpen()) {
                send(session, payload);
            }
        }
    }

    private void send(WebSocketSession session, Object payload) throws IOException {
        String json = objectMapper.writeValueAsString(payload);
        synchronized (session) {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(json));
            }
        }
    }

    private record VisitorPresence(
            String userId,
            Long hallId,
            double x,
            double y,
            double z,
            double yaw,
            Instant updatedAt
    ) {
        static VisitorPresence initial(String userId) {
            return new VisitorPresence(userId, 1L, 0, 1.6, 8.2, 0, Instant.now());
        }

        VisitorPresence merge(JsonNode root) {
            return new VisitorPresence(
                    userId,
                    readLong(root, "hallId", hallId),
                    readDouble(root, "x", x),
                    readDouble(root, "y", y),
                    readDouble(root, "z", z),
                    readDouble(root, "yaw", yaw),
                    Instant.now()
            );
        }

        private static Long readLong(JsonNode root, String field, Long fallback) {
            JsonNode value = root.get(field);
            return value != null && value.canConvertToLong() ? value.asLong() : fallback;
        }

        private static double readDouble(JsonNode root, String field, double fallback) {
            JsonNode value = root.get(field);
            return value != null && value.isNumber() ? value.asDouble() : fallback;
        }
    }
}

package com.example.aiexhibition.realtime;

import com.example.aiexhibition.hall.HallRepository;
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
    private static final int MAX_MESSAGES_PER_SECOND = 120;
    private static final double MAX_ABSOLUTE_POSITION = 1_000;
    private static final double MAX_ABSOLUTE_YAW = 10_000;

    private final ObjectMapper objectMapper;
    private final HallRepository hallRepository;
    // 여러 WebSocket 스레드가 동시에 접속/이동 정보를 수정하므로 thread-safe Map을 사용한다.
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, VisitorPresence> visitors = new ConcurrentHashMap<>();
    private final Map<String, MessageRateLimiter> messageRateLimiters = new ConcurrentHashMap<>();

    public GalleryPresenceWebSocketHandler(ObjectMapper objectMapper, HallRepository hallRepository) {
        this.objectMapper = objectMapper;
        this.hallRepository = hallRepository;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws IOException {
        // 로그인 기능이 없으므로 WebSocket 세션 ID를 이용해 임시 방문자 ID를 만든다.
        String userId = "visitor-" + session.getId();
        VisitorPresence visitor = VisitorPresence.initial(userId);
        sessions.put(session.getId(), session);
        visitors.put(session.getId(), visitor);
        messageRateLimiters.put(session.getId(), new MessageRateLimiter());
        // 아직 JOIN 메시지를 받지 않았으므로 어느 전시관에도 입장시키거나 방송하지 않는다.
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        RateLimitDecision rateLimitDecision = messageRateLimiters
                .computeIfAbsent(session.getId(), ignored -> new MessageRateLimiter())
                .acquire();
        if (rateLimitDecision != RateLimitDecision.ALLOW) {
            if (rateLimitDecision == RateLimitDecision.REJECT_AND_WARN) {
                send(session, Map.of(
                        "type", "ERROR",
                        "message", "Too many websocket messages. Please slow down."
                ));
            }
            return;
        }

        // 모든 메시지는 type 필드로 입장, 이동, WebRTC 신호, 음성 준비 상태를 구분한다.
        JsonNode root = parseMessage(message);
        if (root == null) {
            send(session, Map.of("type", "ERROR", "message", "Invalid JSON message."));
            return;
        }

        String type = root.path("type").asText("");
        if ("SIGNAL".equals(type)) {
            // WebRTC offer/answer/ICE 데이터는 서버가 해석하지 않고 대상 사용자에게 중계한다.
            relaySignal(session, root);
            return;
        }

        if ("VOICE_READY".equals(type) || "VOICE_NOT_READY".equals(type)) {
            // 현재 상태를 저장해야 나중에 입장한 사용자도 기존 사용자의 음성 참여 여부를 알 수 있다.
            boolean voiceReady = "VOICE_READY".equals(type);
            VisitorPresence current = visitors.get(session.getId());
            if (current == null || current.hallId() == null) {
                send(session, Map.of("type", "ERROR", "message", "Join a hall before using voice chat."));
                return;
            }

            VisitorPresence sender = visitors.computeIfPresent(
                    session.getId(),
                    (sessionId, visitor) -> visitor.withVoiceReady(voiceReady)
            );
            if (sender != null) {
                broadcastToHall(sender.hallId(), session.getId(), Map.of(
                        "type", type,
                        "fromUserId", sender.userId()
                ));
            }
            return;
        }

        if (!"JOIN".equals(type) && !"MOVE".equals(type)) {
            send(session, Map.of("type", "ERROR", "message", "Unsupported message type."));
            return;
        }

        VisitorPresence previous = visitors.get(session.getId());
        if (previous == null) {
            send(session, Map.of("type", "ERROR", "message", "Visitor session is not registered."));
            return;
        }

        if ("JOIN".equals(type)) {
            Long requestedHallId = readPositiveHallId(root);
            if (requestedHallId == null) {
                send(session, Map.of("type", "ERROR", "message", "A positive hallId is required to join."));
                return;
            }
            if (!hallRepository.existsById(requestedHallId)) {
                send(session, Map.of("type", "ERROR", "message", "Hall does not exist."));
                return;
            }
            if (!hasValidPose(root)) {
                send(session, Map.of("type", "ERROR", "message", "Invalid position or yaw value."));
                return;
            }

            VisitorPresence updated = previous.join(requestedHallId, root);
            visitors.put(session.getId(), updated);

            if (previous.hallId() != null && !Objects.equals(previous.hallId(), updated.hallId())) {
                broadcastToHall(previous.hallId(), session.getId(), Map.of(
                        "type", "USER_LEFT",
                        "userId", updated.userId()
                ));
            }

            send(session, Map.of(
                    "type", "WELCOME",
                    "userId", updated.userId(),
                    "users", visitorsInHall(updated.hallId(), session.getId())
            ));

            if (!Objects.equals(previous.hallId(), updated.hallId())) {
                broadcastToHall(updated.hallId(), session.getId(), Map.of(
                        "type", "USER_JOINED",
                        "user", updated
                ));
            }
            return;
        }

        if (previous.hallId() == null) {
            send(session, Map.of("type", "ERROR", "message", "Join a hall before moving."));
            return;
        }

        Long requestedHallId = readPositiveHallId(root);
        if (root.has("hallId") && requestedHallId == null) {
            send(session, Map.of("type", "ERROR", "message", "A positive hallId is required."));
            return;
        }
        if (requestedHallId != null && !Objects.equals(requestedHallId, previous.hallId())) {
            send(session, Map.of("type", "ERROR", "message", "Use JOIN to change halls."));
            return;
        }
        if (!hasValidPose(root)) {
            send(session, Map.of("type", "ERROR", "message", "Invalid position or yaw value."));
            return;
        }

        VisitorPresence moved = previous.move(root);
        visitors.put(session.getId(), moved);
        broadcastToHall(moved.hallId(), session.getId(), Map.of(
                // MOVE 메시지는 같은 전시관에 있는 다른 사용자에게만 전달된다.
                "type", "USER_MOVED",
                "user", moved
        ));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws IOException {
        removeSession(session);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.warn("Gallery websocket transport error. session={}", session.getId(), exception);
        removeSession(session);
        if (session.isOpen()) {
            session.close(CloseStatus.SERVER_ERROR);
        }
    }

    private void removeSession(WebSocketSession session) {
        // 연결 종료 시 메모리에서 세션과 위치를 제거하고 퇴장 메시지를 전송한다.
        sessions.remove(session.getId(), session);
        VisitorPresence visitor = visitors.remove(session.getId());
        messageRateLimiters.remove(session.getId());
        if (visitor != null && visitor.hallId() != null) {
            broadcastToHall(visitor.hallId(), session.getId(), Map.of(
                    "type", "USER_LEFT",
                    "userId", visitor.userId()
            ));
        }
    }

    private JsonNode parseMessage(TextMessage message) {
        try {
            return objectMapper.readTree(message.getPayload());
        } catch (JsonProcessingException ex) {
            return null;
        }
    }

    private List<VisitorPresence> visitorsInHall(Long hallId, String excludedSessionId) {
        if (hallId == null) {
            return List.of();
        }

        return visitors.entrySet().stream()
                .filter(entry -> !entry.getKey().equals(excludedSessionId))
                .map(Map.Entry::getValue)
                .filter(visitor -> Objects.equals(visitor.hallId(), hallId))
                .toList();
    }

    private void relaySignal(WebSocketSession senderSession, JsonNode root) throws IOException {
        // WebRTC signaling은 보안을 위해 같은 전시관에 있는 대상에게만 전달한다.
        VisitorPresence sender = visitors.get(senderSession.getId());
        if (sender == null) {
            send(senderSession, Map.of("type", "ERROR", "message", "Sender is not registered."));
            return;
        }
        if (sender.hallId() == null) {
            send(senderSession, Map.of("type", "ERROR", "message", "Join a hall before sending signals."));
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
            if (targetSession != null) {
                removeFailedSession(targetSession, null);
            }
            send(senderSession, Map.of("type", "ERROR", "message", "Target user is not connected."));
            return;
        }

        boolean sent = sendSafely(targetSession, Map.of(
                "type", "SIGNAL",
                "fromUserId", sender.userId(),
                "signal", signal
        ));
        if (!sent) {
            send(senderSession, Map.of("type", "ERROR", "message", "Target user is not connected."));
        }
    }

    private void broadcastToHall(Long hallId, String senderSessionId, Object payload) {
        // 보낸 사람을 제외하고 hallId가 같은 열린 세션에만 메시지를 전송한다.
        if (hallId == null) {
            return;
        }

        for (Map.Entry<String, VisitorPresence> entry : visitors.entrySet()) {
            if (entry.getKey().equals(senderSessionId) || !Objects.equals(entry.getValue().hallId(), hallId)) {
                continue;
            }
            WebSocketSession session = sessions.get(entry.getKey());
            if (session == null) {
                removeOrphanedVisitor(entry.getKey(), entry.getValue());
            } else if (!session.isOpen()) {
                removeFailedSession(session, null);
            } else {
                sendSafely(session, payload);
            }
        }
    }

    private boolean sendSafely(WebSocketSession session, Object payload) {
        try {
            send(session, payload);
            return true;
        } catch (IOException | RuntimeException exception) {
            removeFailedSession(session, exception);
            return false;
        }
    }

    private void removeFailedSession(WebSocketSession session, Throwable cause) {
        if (cause != null) {
            log.warn("Failed to send gallery websocket message. session={}", session.getId(), cause);
        }

        sessions.remove(session.getId(), session);
        VisitorPresence visitor = visitors.remove(session.getId());
        messageRateLimiters.remove(session.getId());

        if (session.isOpen()) {
            try {
                session.close(CloseStatus.SERVER_ERROR);
            } catch (IOException exception) {
                log.debug("Failed to close broken gallery websocket session. session={}", session.getId(), exception);
            }
        }

        if (visitor != null && visitor.hallId() != null) {
            broadcastToHall(visitor.hallId(), session.getId(), Map.of(
                    "type", "USER_LEFT",
                    "userId", visitor.userId()
            ));
        }
    }

    private void removeOrphanedVisitor(String sessionId, VisitorPresence visitor) {
        if (!visitors.remove(sessionId, visitor)) {
            return;
        }

        messageRateLimiters.remove(sessionId);
        if (visitor.hallId() != null) {
            broadcastToHall(visitor.hallId(), sessionId, Map.of(
                    "type", "USER_LEFT",
                    "userId", visitor.userId()
            ));
        }
    }

    private Long readPositiveHallId(JsonNode root) {
        JsonNode value = root.get("hallId");
        if (value == null || !value.isIntegralNumber()) {
            return null;
        }

        long hallId = value.asLong();
        return hallId > 0 ? hallId : null;
    }

    private boolean hasValidPose(JsonNode root) {
        return isValidOptionalNumber(root, "x", MAX_ABSOLUTE_POSITION)
                && isValidOptionalNumber(root, "y", MAX_ABSOLUTE_POSITION)
                && isValidOptionalNumber(root, "z", MAX_ABSOLUTE_POSITION)
                && isValidOptionalNumber(root, "yaw", MAX_ABSOLUTE_YAW);
    }

    private boolean isValidOptionalNumber(JsonNode root, String field, double maximumAbsoluteValue) {
        JsonNode value = root.get(field);
        if (value == null) {
            return true;
        }
        if (!value.isNumber()) {
            return false;
        }

        double number = value.asDouble();
        return Double.isFinite(number) && Math.abs(number) <= maximumAbsoluteValue;
    }

    private void send(WebSocketSession session, Object payload) throws IOException {
        String json = objectMapper.writeValueAsString(payload);
        // 동일 세션에 여러 스레드가 동시에 쓰지 못하도록 전송 구간을 동기화한다.
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
            boolean voiceReady,
            Instant updatedAt
    ) {
        static VisitorPresence initial(String userId) {
            return new VisitorPresence(userId, null, 0, 1.6, 8.2, 0, false, Instant.now());
        }

        VisitorPresence join(Long requestedHallId, JsonNode root) {
            return new VisitorPresence(
                    userId,
                    requestedHallId,
                    readDouble(root, "x", x),
                    readDouble(root, "y", y),
                    readDouble(root, "z", z),
                    readDouble(root, "yaw", yaw),
                    voiceReady,
                    Instant.now()
            );
        }

        VisitorPresence move(JsonNode root) {
            // 이동은 좌표와 방향만 바꾸며, 전시관 변경은 JOIN 메시지만 담당한다.
            return new VisitorPresence(
                    userId,
                    hallId,
                    readDouble(root, "x", x),
                    readDouble(root, "y", y),
                    readDouble(root, "z", z),
                    readDouble(root, "yaw", yaw),
                    voiceReady,
                    Instant.now()
            );
        }

        VisitorPresence withVoiceReady(boolean ready) {
            return new VisitorPresence(userId, hallId, x, y, z, yaw, ready, Instant.now());
        }

        private static double readDouble(JsonNode root, String field, double fallback) {
            JsonNode value = root.get(field);
            return value != null && value.isNumber() ? value.asDouble() : fallback;
        }
    }

    private enum RateLimitDecision {
        ALLOW,
        REJECT,
        REJECT_AND_WARN
    }

    private static final class MessageRateLimiter {

        private static final long WINDOW_NANOS = 1_000_000_000L;

        private long windowStartedAt = System.nanoTime();
        private int messageCount;
        private boolean warningSent;

        synchronized RateLimitDecision acquire() {
            long now = System.nanoTime();
            if (now - windowStartedAt >= WINDOW_NANOS) {
                windowStartedAt = now;
                messageCount = 0;
                warningSent = false;
            }

            messageCount++;
            if (messageCount <= MAX_MESSAGES_PER_SECOND) {
                return RateLimitDecision.ALLOW;
            }
            if (!warningSent) {
                warningSent = true;
                return RateLimitDecision.REJECT_AND_WARN;
            }
            return RateLimitDecision.REJECT;
        }
    }
}

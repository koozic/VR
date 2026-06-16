package com.example.aiexhibition.realtime;

import com.example.aiexhibition.hall.HallRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class GalleryPresenceWebSocketHandler extends TextWebSocketHandler {

    private static final int MAX_MESSAGES_PER_SECOND = 120;
    private static final int MAX_CHAT_MESSAGE_LENGTH = 200;
    private static final double MAX_ABSOLUTE_POSITION = 1_000;
    private static final double MAX_ABSOLUTE_YAW = 10_000;
    private static final long HEARTBEAT_TIMEOUT_SECONDS = 120;
    private static final Set<String> ALLOWED_EMOTES = Set.of("WAVE", "CLAP", "HEART", "POINT");
    private static final Set<String> ALLOWED_SIGNAL_KINDS = Set.of("offer", "answer", "ice");
    private static final int MAX_SIGNAL_LENGTH = 32_000;

    private final ObjectMapper objectMapper;
    private final HallRepository hallRepository;
    private final GalleryPresenceRegistry registry;

    public GalleryPresenceWebSocketHandler(ObjectMapper objectMapper, HallRepository hallRepository) {
        this.objectMapper = objectMapper;
        this.hallRepository = hallRepository;
        this.registry = new GalleryPresenceRegistry(objectMapper, MAX_MESSAGES_PER_SECOND);
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        registry.register(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        GalleryRateLimitDecision rateLimitDecision = registry.acquireRateLimit(session);
        if (rateLimitDecision != GalleryRateLimitDecision.ALLOW) {
            if (rateLimitDecision == GalleryRateLimitDecision.REJECT_AND_WARN) {
                send(session, Map.of(
                        "type", "ERROR",
                        "message", "Too many websocket messages. Please slow down."
                ));
            }
            return;
        }
        registry.touch(session);

        JsonNode root = parseMessage(message);
        if (root == null) {
            send(session, Map.of("type", "ERROR", "message", "Invalid JSON message."));
            return;
        }

        ClientMessageType type = ClientMessageType.from(root);
        if (type == null) {
            send(session, Map.of("type", "ERROR", "message", "Unsupported message type."));
            return;
        }

        if (type == ClientMessageType.PING) {
            send(session, Map.of(
                    "type", "PONG",
                    "timestamp", Instant.now().toString()
            ));
            return;
        }

        if (type == ClientMessageType.CHAT) {
            handleChat(session, root);
            return;
        }

        if (type == ClientMessageType.EMOTE) {
            handleEmote(session, root);
            return;
        }

        if (type == ClientMessageType.SIGNAL) {
            relaySignal(session, root);
            return;
        }

        if (type == ClientMessageType.VOICE_READY || type == ClientMessageType.VOICE_NOT_READY) {
            handleVoiceReady(session, type);
            return;
        }

        if (type == ClientMessageType.VOICE_ACTIVITY) {
            handleVoiceActivity(session, root);
            return;
        }

        if (type == ClientMessageType.JOIN) {
            handleJoin(session, root);
            return;
        }

        if (type == ClientMessageType.MOVE) {
            handleMove(session, root);
            return;
        }

        send(session, Map.of("type", "ERROR", "message", "Unsupported message type."));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        registry.removeSession(session);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        registry.removeFailedSession(session, exception);
    }

    private JsonNode parseMessage(TextMessage message) {
        try {
            return objectMapper.readTree(message.getPayload());
        } catch (JsonProcessingException exception) {
            return null;
        }
    }

    private void handleJoin(WebSocketSession session, JsonNode root) throws IOException {
        GalleryVisitorPresence previous = registry.visitor(session);
        if (previous == null) {
            send(session, Map.of("type", "ERROR", "message", "Visitor session is not registered."));
            return;
        }

        Long requestedHallId = readPositiveHallId(root);
        if (requestedHallId == null) {
            send(session, Map.of("type", "ERROR", "message", "A positive hallId is required to join."));
            return;
        }
        if (!hallRepository.existsById(requestedHallId)) {
            send(session, Map.of("type", "ERROR", "message", "Hall does not exist."));
            return;
        }
        String clientId = readClientId(root);
        if (root.has("clientId") && clientId == null) {
            send(session, Map.of("type", "ERROR", "message", "Invalid clientId."));
            return;
        }
        if (!hasValidPose(root)) {
            send(session, Map.of("type", "ERROR", "message", "Invalid position or yaw value."));
            return;
        }

        GalleryPresenceRegistry.JoinResult joinResult = registry.join(session, requestedHallId, clientId, root);
        GalleryVisitorPresence updated = joinResult.updated();

        if (previous.hallId() != null && !Objects.equals(previous.hallId(), updated.hallId())) {
            registry.broadcastToHall(previous.hallId(), session.getId(), Map.of(
                    "type", "USER_LEFT",
                    "userId", updated.userId()
            ));
        }

        send(session, Map.of(
                "type", "WELCOME",
                "userId", updated.userId(),
                "users", registry.visitorsInHall(updated.hallId(), session.getId()),
                "self", updated,
                "resumed", joinResult.resumed()
        ));

        if (!Objects.equals(previous.hallId(), updated.hallId())) {
            registry.broadcastToHall(updated.hallId(), session.getId(), Map.of(
                    "type", "USER_JOINED",
                    "user", updated
            ));
        }
    }

    private void handleMove(WebSocketSession session, JsonNode root) throws IOException {
        GalleryVisitorPresence previous = registry.visitor(session);
        if (previous == null) {
            send(session, Map.of("type", "ERROR", "message", "Visitor session is not registered."));
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

        GalleryVisitorPresence moved = registry.move(session, root);
        if (moved != null) {
            registry.broadcastToHall(moved.hallId(), session.getId(), Map.of(
                    "type", "USER_MOVED",
                    "user", moved
            ));
        }
    }

    private void handleChat(WebSocketSession session, JsonNode root) throws IOException {
        GalleryVisitorPresence sender = registry.joinedVisitor(session);
        if (sender == null) {
            send(session, Map.of("type", "ERROR", "message", "Join a hall before chatting."));
            return;
        }

        JsonNode messageNode = root.get("message");
        String message = messageNode != null && messageNode.isTextual()
                ? messageNode.asText().trim()
                : "";
        if (message.isEmpty() || message.length() > MAX_CHAT_MESSAGE_LENGTH) {
            send(session, Map.of(
                    "type", "ERROR",
                    "message", "Chat message must be between 1 and 200 characters."
            ));
            return;
        }

        registry.broadcastToHall(sender.hallId(), null, Map.of(
                "type", "CHAT_MESSAGE",
                "messageId", UUID.randomUUID().toString(),
                "userId", sender.userId(),
                "message", message,
                "timestamp", Instant.now().toString()
        ));
    }

    private void handleEmote(WebSocketSession session, JsonNode root) throws IOException {
        GalleryVisitorPresence sender = registry.joinedVisitor(session);
        if (sender == null) {
            send(session, Map.of("type", "ERROR", "message", "Join a hall before using emotes."));
            return;
        }

        String emote = root.path("emote").asText("").trim().toUpperCase();
        if (!ALLOWED_EMOTES.contains(emote)) {
            send(session, Map.of("type", "ERROR", "message", "Unsupported emote."));
            return;
        }

        registry.broadcastToHall(sender.hallId(), null, Map.of(
                "type", "EMOTE_RECEIVED",
                "userId", sender.userId(),
                "emote", emote,
                "timestamp", Instant.now().toString()
        ));
    }

    private void handleVoiceReady(WebSocketSession session, ClientMessageType type) throws IOException {
        boolean voiceReady = type == ClientMessageType.VOICE_READY;
        GalleryVisitorPresence current = registry.visitor(session);
        if (current == null || current.hallId() == null) {
            send(session, Map.of("type", "ERROR", "message", "Join a hall before using voice chat."));
            return;
        }

        GalleryVisitorPresence sender = registry.updateVoiceReady(session, voiceReady);
        if (sender != null) {
            registry.broadcastToHall(sender.hallId(), session.getId(), Map.of(
                    "type", type.wireName(),
                    "fromUserId", sender.userId()
            ));
        }
    }

    private void handleVoiceActivity(WebSocketSession session, JsonNode root) throws IOException {
        GalleryVisitorPresence current = registry.joinedVisitor(session);
        if (current == null || !current.voiceReady()) {
            send(session, Map.of(
                    "type", "ERROR",
                    "message", "Join voice chat before sending voice activity."
            ));
            return;
        }

        JsonNode speakingNode = root.get("speaking");
        if (speakingNode == null || !speakingNode.isBoolean()) {
            send(session, Map.of("type", "ERROR", "message", "Voice activity must be a boolean."));
            return;
        }

        GalleryVisitorPresence sender = registry.updateVoiceSpeaking(session, speakingNode.asBoolean());
        if (sender != null) {
            registry.broadcastToHall(sender.hallId(), session.getId(), Map.of(
                    "type", "VOICE_ACTIVITY",
                    "fromUserId", sender.userId(),
                    "speaking", sender.voiceSpeaking()
            ));
        }
    }

    private void relaySignal(WebSocketSession senderSession, JsonNode root) throws IOException {
        GalleryVisitorPresence sender = registry.visitor(senderSession);
        if (sender == null) {
            send(senderSession, Map.of("type", "ERROR", "message", "Sender is not registered."));
            return;
        }
        if (sender.hallId() == null) {
            send(senderSession, Map.of("type", "ERROR", "message", "Join a hall before sending signals."));
            return;
        }
        if (!sender.voiceReady()) {
            send(senderSession, Map.of("type", "ERROR", "message", "Join voice chat before sending signals."));
            return;
        }

        String targetUserId = root.path("targetUserId").asText("");
        JsonNode signal = root.get("signal");
        if (targetUserId.isBlank() || signal == null || signal.isNull()) {
            send(senderSession, Map.of("type", "ERROR", "message", "Invalid signaling message."));
            return;
        }

        String signalKind = signal.path("kind").asText("");
        if (!ALLOWED_SIGNAL_KINDS.contains(signalKind) || signal.toString().length() > MAX_SIGNAL_LENGTH) {
            send(senderSession, Map.of("type", "ERROR", "message", "Unsupported or oversized signaling message."));
            return;
        }

        WebSocketSession targetSession = registry.findVoiceReadySession(targetUserId, sender.hallId());
        if (targetSession == null) {
            send(senderSession, Map.of("type", "ERROR", "message", "Target user is not connected."));
            return;
        }

        boolean sent = registry.sendSafely(targetSession, Map.of(
                "type", "SIGNAL",
                "fromUserId", sender.userId(),
                "signal", signal
        ));
        if (!sent) {
            send(senderSession, Map.of("type", "ERROR", "message", "Target user is not connected."));
        }
    }

    @Scheduled(fixedRate = 10_000)
    void removeStaleSessions() {
        removeStaleSessions(Instant.now());
    }

    void removeStaleSessions(Instant now) {
        registry.removeStaleSessions(now, HEARTBEAT_TIMEOUT_SECONDS);
    }

    private Long readPositiveHallId(JsonNode root) {
        JsonNode value = root.get("hallId");
        if (value == null || !value.isIntegralNumber()) {
            return null;
        }

        long hallId = value.asLong();
        return hallId > 0 ? hallId : null;
    }

    private String readClientId(JsonNode root) {
        JsonNode value = root.get("clientId");
        if (value == null || !value.isTextual()) {
            return null;
        }

        String clientId = value.asText().trim();
        return clientId.matches("[A-Za-z0-9-]{8,80}") ? clientId : null;
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
        registry.send(session, payload);
    }

    private enum ClientMessageType {
        PING,
        CHAT,
        EMOTE,
        SIGNAL,
        VOICE_READY,
        VOICE_NOT_READY,
        VOICE_ACTIVITY,
        JOIN,
        MOVE;

        static ClientMessageType from(JsonNode root) {
            String rawType = root.path("type").asText("");
            if (rawType.isBlank()) {
                return null;
            }

            try {
                return ClientMessageType.valueOf(rawType);
            } catch (IllegalArgumentException exception) {
                return null;
            }
        }

        String wireName() {
            return name();
        }
    }
}

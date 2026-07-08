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

/**
 * /ws/gallery로 들어오는 실시간 메시지를 받아 입장, 이동, 채팅, 감정표현, 음성 시그널을 처리한다.
 */
@Component
public class GalleryPresenceWebSocketHandler extends TextWebSocketHandler {

    // 한 사용자가 1초에 보낼 수 있는 최대 WebSocket 메시지 수다.
    private static final int MAX_MESSAGES_PER_SECOND = 120;
    // 채팅 말풍선 한 개의 최대 길이다.
    private static final int MAX_CHAT_MESSAGE_LENGTH = 200;
    private static final int MAX_NICKNAME_LENGTH = 20;
    // 좌표 값이 비정상적으로 커져 서버/프런트를 흔들지 못하게 막는 한계값이다.
    private static final double MAX_ABSOLUTE_POSITION = 1_000;
    // 회전값(yaw)이 비정상적으로 커지는 것을 막는 한계값이다.
    private static final double MAX_ABSOLUTE_YAW = 10_000;
    // 이 시간 동안 메시지가 없으면 끊긴 연결로 보고 정리한다.
    private static final long HEARTBEAT_TIMEOUT_SECONDS = 120;
    // 서버가 허용하는 감정표현 ID 목록이다.
    private static final Set<String> ALLOWED_EMOTES = Set.of("WAVE", "CLAP", "HEART", "POINT");
    // WebRTC 음성 연결에 필요한 signal 종류만 통과시킨다.
    private static final Set<String> ALLOWED_SIGNAL_KINDS = Set.of("offer", "answer", "ice");
    // 너무 큰 WebRTC signal 메시지를 막는 최대 길이다.
    private static final int MAX_SIGNAL_LENGTH = 32_000;

    // JSON 문자열과 자바 객체를 서로 변환한다.
    private final ObjectMapper objectMapper;
    // JOIN할 hallId가 실제 전시관인지 확인한다.
    private final HallRepository hallRepository;
    // 현재 접속자 상태를 관리하는 내부 저장소다.
    private final GalleryPresenceRegistry registry;

    public GalleryPresenceWebSocketHandler(ObjectMapper objectMapper, HallRepository hallRepository) {
        this.objectMapper = objectMapper;
        this.hallRepository = hallRepository;
        this.registry = new GalleryPresenceRegistry(objectMapper, MAX_MESSAGES_PER_SECOND);
    }

    // WebSocket 연결이 처음 열리면 아직 JOIN 전인 기본 방문자 상태를 만든다.
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        registry.register(session);
    }

    // 프런트가 보낸 JSON 메시지의 type을 보고 알맞은 처리 메서드로 나눈다.
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
        // 정상 메시지를 받았으므로 heartbeat timeout에서 제외되도록 활동 시각을 갱신한다.
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

    // 브라우저가 연결을 닫으면 접속자 목록에서 제거한다.
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        registry.removeSession(session);
    }

    // 네트워크 오류가 나면 세션을 정리한다.
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        registry.removeFailedSession(session, exception);
    }

    // TextMessage의 payload를 JSON으로 파싱한다. 실패하면 null로 돌려준다.
    private JsonNode parseMessage(TextMessage message) {
        try {
            return objectMapper.readTree(message.getPayload());
        } catch (JsonProcessingException exception) {
            return null;
        }
    }

    // 사용자를 특정 전시관에 입장시키고, 같은 전시관 사용자 목록을 돌려준다.
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
        String nickname = readNickname(root);
        if (root.has("nickname") && nickname == null) {
            send(session, Map.of("type", "ERROR", "message", "Invalid nickname."));
            return;
        }
        String characterId = readCharacterId(root);
        if (root.has("characterId") && characterId == null) {
            send(session, Map.of("type", "ERROR", "message", "Invalid characterId."));
            return;
        }
        if (!hasValidPose(root)) {
            send(session, Map.of("type", "ERROR", "message", "Invalid position or yaw value."));
            return;
        }

        GalleryPresenceRegistry.JoinResult joinResult = registry.join(
                session,
                requestedHallId,
                clientId,
                nickname,
                characterId,
                root
        );
        GalleryVisitorPresence updated = joinResult.updated();

        // 기존 전시관에서 다른 전시관으로 이동한 경우 이전 전시관 사람들에게 퇴장을 알린다.
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

        // 새 전시관의 다른 사용자들에게 입장을 알린다.
        if (!Objects.equals(previous.hallId(), updated.hallId())) {
            registry.broadcastToHall(updated.hallId(), session.getId(), Map.of(
                    "type", "USER_JOINED",
                    "user", updated
            ));
        }
    }

    // 좌표 이동 메시지를 검증하고 같은 전시관 사용자들에게 새 위치를 중계한다.
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

    // 채팅 메시지를 검증하고 같은 전시관 사용자들에게 말풍선 이벤트를 보낸다.
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
                "nickname", sender.nickname(),
                "message", message,
                "timestamp", Instant.now().toString()
        ));
    }

    // 감정표현 ID를 검증하고 같은 전시관 사용자들에게 이모션 이벤트를 보낸다.
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
                "nickname", sender.nickname(),
                "emote", emote,
                "timestamp", Instant.now().toString()
        ));
    }

    // 사용자가 음성 채팅에 들어오거나 나갔다는 상태를 저장하고 주변 사용자에게 알린다.
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

    // 사용자가 말하고 있는지 여부를 저장하고 주변 사용자에게 알려 머리 위 표시를 갱신하게 한다.
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

    // 음성 채팅용 WebRTC offer/answer/ice 메시지를 대상 사용자에게 중계한다.
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

    // 10초마다 오래 활동이 없는 WebSocket 세션을 청소한다.
    @Scheduled(fixedRate = 10_000)
    void removeStaleSessions() {
        removeStaleSessions(Instant.now());
    }

    // 테스트에서 현재 시각을 주입해 heartbeat 청소 로직을 검증할 수 있게 분리했다.
    void removeStaleSessions(Instant now) {
        registry.removeStaleSessions(now, HEARTBEAT_TIMEOUT_SECONDS);
    }

    // JSON에서 양수 hallId만 읽는다.
    private Long readPositiveHallId(JsonNode root) {
        JsonNode value = root.get("hallId");
        if (value == null || !value.isIntegralNumber()) {
            return null;
        }

        long hallId = value.asLong();
        return hallId > 0 ? hallId : null;
    }

    // 브라우저가 보낸 clientId를 읽고, 너무 이상한 문자열은 거절한다.
    private String readClientId(JsonNode root) {
        JsonNode value = root.get("clientId");
        if (value == null || !value.isTextual()) {
            return null;
        }

        String clientId = value.asText().trim();
        return clientId.matches("[A-Za-z0-9-]{8,80}") ? clientId : null;
    }

    private String readNickname(JsonNode root) {
        JsonNode value = root.get("nickname");
        if (value == null) {
            return null;
        }
        if (!value.isTextual()) {
            return null;
        }

        String nickname = value.asText().trim().replaceAll("\\s+", " ");
        if (nickname.isBlank() || nickname.length() > MAX_NICKNAME_LENGTH) {
            return null;
        }
        for (int index = 0; index < nickname.length(); index += 1) {
            if (Character.isISOControl(nickname.charAt(index))) {
                return null;
            }
        }
        return nickname;
    }

    private String readCharacterId(JsonNode root) {
        JsonNode value = root.get("characterId");
        if (value == null) {
            return null;
        }
        if (!value.isTextual()) {
            return null;
        }

        String characterId = value.asText().trim().toLowerCase();
        return characterId.matches("character-[a-r]") ? characterId : null;
    }

    // 위치와 회전값이 모두 숫자 범위 안에 있는지 확인한다.
    private boolean hasValidPose(JsonNode root) {
        return isValidOptionalNumber(root, "x", MAX_ABSOLUTE_POSITION)
                && isValidOptionalNumber(root, "y", MAX_ABSOLUTE_POSITION)
                && isValidOptionalNumber(root, "z", MAX_ABSOLUTE_POSITION)
                && isValidOptionalNumber(root, "yaw", MAX_ABSOLUTE_YAW);
    }

    // 선택 필드는 없으면 통과시키고, 있으면 숫자/범위 검사를 한다.
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

    // Registry의 공통 전송 로직을 통해 현재 세션에 응답을 보낸다.
    private void send(WebSocketSession session, Object payload) throws IOException {
        registry.send(session, payload);
    }

    // 프런트엔드가 보낼 수 있는 WebSocket 메시지 type 목록이다.
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

        // JSON의 type 문자열을 enum으로 바꾼다. 모르는 값이면 null을 반환한다.
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

        // 프런트에 다시 보낼 때 사용할 메시지 이름이다.
        String wireName() {
            return name();
        }
    }
}

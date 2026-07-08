package com.example.aiexhibition.realtime;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

/**
 * 현재 연결된 WebSocket 세션과 관람객 상태를 한곳에서 관리하는 저장소 역할의 클래스다.
 */
final class GalleryPresenceRegistry {

    private static final Logger log = LoggerFactory.getLogger(GalleryPresenceRegistry.class);
    // 새로고침 후 이전 위치를 복구할 수 있는 최대 시간이다.
    private static final long RESUME_STATE_TTL_SECONDS = 120;

    // 서버 객체를 JSON 문자열로 바꿔 WebSocket으로 보낼 때 사용한다.
    private final ObjectMapper objectMapper;
    // 세션별 메시지 속도 제한 기준이다.
    private final int maxMessagesPerSecond;
    // sessionId -> 실제 WebSocket 연결 객체.
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    // sessionId -> 관람객 현재 위치/상태.
    private final Map<String, GalleryVisitorPresence> visitors = new ConcurrentHashMap<>();
    // sessionId -> 초당 메시지 제한기.
    private final Map<String, GalleryMessageRateLimiter> messageRateLimiters = new ConcurrentHashMap<>();
    // sessionId -> 마지막으로 메시지를 받은 시각. heartbeat timeout 판단에 사용한다.
    private final Map<String, Instant> lastActivityAt = new ConcurrentHashMap<>();
    // sessionId -> 브라우저가 보내준 clientId.
    private final Map<String, String> clientIdsBySessionId = new ConcurrentHashMap<>();
    // clientId -> 현재 살아 있는 sessionId. 새로고침/중복 접속 처리에 사용한다.
    private final Map<String, String> sessionIdsByClientId = new ConcurrentHashMap<>();
    // userId -> 현재 살아 있는 sessionId. 음성 시그널 대상 찾기에 사용한다.
    private final Map<String, String> sessionIdsByUserId = new ConcurrentHashMap<>();
    // clientId -> 잠시 보관하는 재접속 복구 상태.
    private final Map<String, GalleryResumeState> resumeStates = new ConcurrentHashMap<>();

    GalleryPresenceRegistry(ObjectMapper objectMapper, int maxMessagesPerSecond) {
        this.objectMapper = objectMapper;
        this.maxMessagesPerSecond = maxMessagesPerSecond;
    }

    // WebSocket 연결이 열리면 기본 관람객 상태와 제한기를 등록한다.
    void register(WebSocketSession session) {
        String userId = "visitor-" + session.getId();
        sessions.put(session.getId(), session);
        visitors.put(session.getId(), GalleryVisitorPresence.initial(userId));
        messageRateLimiters.put(session.getId(), new GalleryMessageRateLimiter(maxMessagesPerSecond));
        lastActivityAt.put(session.getId(), Instant.now());
    }

    // 이 세션이 이번 메시지를 처리해도 되는지 속도 제한을 확인한다.
    GalleryRateLimitDecision acquireRateLimit(WebSocketSession session) {
        return messageRateLimiters
                .computeIfAbsent(session.getId(), ignored -> new GalleryMessageRateLimiter(maxMessagesPerSecond))
                .acquire();
    }

    // 정상 메시지를 받았다는 뜻으로 마지막 활동 시각을 갱신한다.
    void touch(WebSocketSession session) {
        lastActivityAt.put(session.getId(), Instant.now());
    }

    // 세션에 연결된 관람객 상태를 조회한다.
    GalleryVisitorPresence visitor(WebSocketSession session) {
        return visitors.get(session.getId());
    }

    // 전시관에 JOIN까지 완료한 관람객만 반환한다.
    GalleryVisitorPresence joinedVisitor(WebSocketSession session) {
        GalleryVisitorPresence visitor = visitor(session);
        return visitor != null && visitor.hallId() != null ? visitor : null;
    }

    // 같은 전시관에 있는 다른 관람객 목록을 만든다.
    List<GalleryVisitorPresence> visitorsInHall(Long hallId, String excludedSessionId) {
        if (hallId == null) {
            return List.of();
        }

        return visitors.entrySet().stream()
                .filter(entry -> !entry.getKey().equals(excludedSessionId))
                .map(Map.Entry::getValue)
                .filter(visitor -> Objects.equals(visitor.hallId(), hallId))
                .toList();
    }

    // JOIN 메시지를 처리해 전시관 입장, 재접속 복구, 중복 세션 교체를 한 번에 수행한다.
    JoinResult join(
            WebSocketSession session,
            Long requestedHallId,
            String clientId,
            String nickname,
            String characterId,
            com.fasterxml.jackson.databind.JsonNode root
    ) {
        GalleryVisitorPresence previous = visitors.get(session.getId());
        if (previous == null) {
            throw new IllegalStateException("Visitor session is not registered.");
        }

        String effectiveClientId = clientId == null ? session.getId() : clientId;
        GalleryResumeState resumeState = takeResumeState(effectiveClientId, Instant.now());
        GalleryVisitorPresence resumableVisitor = resumeState == null ? null : resumeState.visitor();

        String previousClientId = clientIdsBySessionId.put(session.getId(), effectiveClientId);
        if (previousClientId != null && !previousClientId.equals(effectiveClientId)) {
            sessionIdsByClientId.remove(previousClientId, session.getId());
        }

        String replacedSessionId = sessionIdsByClientId.put(effectiveClientId, session.getId());
        if (replacedSessionId != null && !replacedSessionId.equals(session.getId())) {
            WebSocketSession replacedSession = sessions.get(replacedSessionId);
            GalleryVisitorPresence replacedVisitor = removeSessionState(replacedSessionId, replacedSession, false, false);
            if (resumableVisitor == null) {
                resumableVisitor = replacedVisitor;
            }
            closeReplacedSession(replacedSession);
        }

        boolean resumed = resumableVisitor != null
                && Objects.equals(resumableVisitor.hallId(), requestedHallId);
        GalleryVisitorPresence updated = previous.join(
                stableUserId(effectiveClientId),
                requestedHallId,
                nickname,
                characterId,
                root,
                resumableVisitor
        );
        visitors.put(session.getId(), updated);
        sessionIdsByUserId.remove(previous.userId(), session.getId());
        sessionIdsByUserId.put(updated.userId(), session.getId());

        return new JoinResult(previous, updated, resumed);
    }

    // MOVE 메시지를 반영해 현재 좌표를 갱신한다.
    GalleryVisitorPresence move(WebSocketSession session, com.fasterxml.jackson.databind.JsonNode root) {
        GalleryVisitorPresence current = visitors.get(session.getId());
        if (current == null) {
            return null;
        }

        GalleryVisitorPresence moved = current.move(root);
        visitors.put(session.getId(), moved);
        sessionIdsByUserId.put(moved.userId(), session.getId());
        return moved;
    }

    // 음성 채팅 참여 여부를 저장한다.
    GalleryVisitorPresence updateVoiceReady(WebSocketSession session, boolean voiceReady) {
        return visitors.computeIfPresent(
                session.getId(),
                (sessionId, visitor) -> visitor.withVoiceReady(voiceReady)
        );
    }

    // 말하는 중 표시를 저장한다.
    GalleryVisitorPresence updateVoiceSpeaking(WebSocketSession session, boolean speaking) {
        return visitors.computeIfPresent(
                session.getId(),
                (sessionId, visitor) -> visitor.withVoiceSpeaking(speaking)
        );
    }

    // WebRTC signal을 보낼 대상 사용자의 살아 있는 WebSocket 세션을 찾는다.
    WebSocketSession findVoiceReadySession(String userId, Long hallId) {
        String sessionId = sessionIdsByUserId.get(userId);
        if (sessionId == null) {
            return null;
        }

        GalleryVisitorPresence visitor = visitors.get(sessionId);
        if (visitor == null
                || !Objects.equals(visitor.userId(), userId)
                || !Objects.equals(visitor.hallId(), hallId)
                || !visitor.voiceReady()) {
            return null;
        }

        WebSocketSession session = sessions.get(sessionId);
        if (session == null) {
            removeSessionState(sessionId, null, true, true);
            return null;
        }
        if (!session.isOpen()) {
            removeFailedSession(session, null);
            return null;
        }
        return session;
    }

    // 정상 종료된 WebSocket 세션을 정리한다.
    void removeSession(WebSocketSession session) {
        removeSessionState(session.getId(), session, true, true);
    }

    // 전송 실패나 transport 오류가 난 세션을 정리하고 필요하면 연결도 닫는다.
    void removeFailedSession(WebSocketSession session, Throwable cause) {
        if (cause != null) {
            log.warn("Failed to send gallery websocket message. session={}", session.getId(), cause);
        }

        removeSessionState(session.getId(), session, true, true);

        if (session.isOpen()) {
            try {
                session.close(CloseStatus.SERVER_ERROR);
            } catch (IOException exception) {
                log.debug("Failed to close broken gallery websocket session. session={}", session.getId(), exception);
            }
        }
    }

    // 같은 전시관에 있는 사용자들에게 메시지를 뿌린다.
    void broadcastToHall(Long hallId, String senderSessionId, Object payload) {
        if (hallId == null) {
            return;
        }

        for (Map.Entry<String, GalleryVisitorPresence> entry : visitors.entrySet()) {
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

    // 한 명에게 메시지를 보내되 실패하면 세션 정리까지 처리한다.
    boolean sendSafely(WebSocketSession session, Object payload) {
        try {
            send(session, payload);
            return true;
        } catch (IOException | RuntimeException exception) {
            removeFailedSession(session, exception);
            return false;
        }
    }

    // payload 객체를 JSON 문자열로 바꿔 WebSocket으로 보낸다.
    void send(WebSocketSession session, Object payload) throws IOException {
        String json = objectMapper.writeValueAsString(payload);
        synchronized (session) {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(json));
            }
        }
    }

    // heartbeat가 오래 끊긴 세션과 만료된 재접속 복구 상태를 청소한다.
    void removeStaleSessions(Instant now, long heartbeatTimeoutSeconds) {
        Instant cutoff = now.minusSeconds(heartbeatTimeoutSeconds);
        for (Map.Entry<String, Instant> entry : lastActivityAt.entrySet()) {
            if (!entry.getValue().isBefore(cutoff)) {
                continue;
            }

            WebSocketSession session = sessions.get(entry.getKey());
            if (session != null) {
                log.info("Closing stale gallery websocket session. session={}", session.getId());
                removeFailedSession(session, null);
            } else {
                lastActivityAt.remove(entry.getKey(), entry.getValue());
            }
        }
        resumeStates.entrySet().removeIf(entry -> entry.getValue().expiresAt().isBefore(now));
    }

    // clientId에 저장된 복구 상태를 한 번 꺼내고 즉시 제거한다.
    private GalleryResumeState takeResumeState(String clientId, Instant now) {
        GalleryResumeState state = resumeStates.remove(clientId);
        return state != null && !state.expiresAt().isBefore(now) ? state : null;
    }

    // 세션 관련 Map들을 한꺼번에 정리하고, 필요하면 재접속용 상태를 잠시 보관한다.
    private GalleryVisitorPresence removeSessionState(
            String sessionId,
            WebSocketSession session,
            boolean rememberForReconnect,
            boolean broadcastDeparture
    ) {
        if (session == null) {
            sessions.remove(sessionId);
        } else {
            sessions.remove(sessionId, session);
        }

        GalleryVisitorPresence visitor = visitors.remove(sessionId);
        messageRateLimiters.remove(sessionId);
        lastActivityAt.remove(sessionId);

        if (visitor != null) {
            sessionIdsByUserId.remove(visitor.userId(), sessionId);
        }

        String clientId = clientIdsBySessionId.remove(sessionId);
        if (clientId != null) {
            sessionIdsByClientId.remove(clientId, sessionId);
            if (rememberForReconnect && visitor != null) {
                resumeStates.put(
                        clientId,
                        new GalleryResumeState(visitor, Instant.now().plusSeconds(RESUME_STATE_TTL_SECONDS))
                );
            }
        }

        if (broadcastDeparture && visitor != null && visitor.hallId() != null) {
            broadcastToHall(visitor.hallId(), sessionId, Map.of(
                    "type", "USER_LEFT",
                    "userId", visitor.userId()
            ));
        }
        return visitor;
    }

    // 세션 객체 없이 상태만 남은 경우를 정리한다.
    private void removeOrphanedVisitor(String sessionId, GalleryVisitorPresence visitor) {
        if (visitors.get(sessionId) != visitor) {
            return;
        }
        removeSessionState(sessionId, null, true, true);
    }

    // 같은 clientId가 새로 접속했을 때 이전 WebSocket 연결을 정상 종료한다.
    private void closeReplacedSession(WebSocketSession session) {
        if (session == null || !session.isOpen()) {
            return;
        }
        try {
            session.close(CloseStatus.NORMAL);
        } catch (IOException exception) {
            log.debug("Failed to close replaced gallery websocket session. session={}", session.getId(), exception);
        }
    }

    // clientId가 같으면 새로고침 후에도 같은 userId가 유지되도록 만든다.
    private String stableUserId(String clientId) {
        return "visitor-" + clientId;
    }

    // JOIN 처리 결과를 Handler로 돌려주기 위한 작은 결과 DTO다.
    record JoinResult(
            GalleryVisitorPresence previous,
            GalleryVisitorPresence updated,
            boolean resumed
    ) {
    }
}

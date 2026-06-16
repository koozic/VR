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

final class GalleryPresenceRegistry {

    private static final Logger log = LoggerFactory.getLogger(GalleryPresenceRegistry.class);
    private static final long RESUME_STATE_TTL_SECONDS = 120;

    private final ObjectMapper objectMapper;
    private final int maxMessagesPerSecond;
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, GalleryVisitorPresence> visitors = new ConcurrentHashMap<>();
    private final Map<String, GalleryMessageRateLimiter> messageRateLimiters = new ConcurrentHashMap<>();
    private final Map<String, Instant> lastActivityAt = new ConcurrentHashMap<>();
    private final Map<String, String> clientIdsBySessionId = new ConcurrentHashMap<>();
    private final Map<String, String> sessionIdsByClientId = new ConcurrentHashMap<>();
    private final Map<String, String> sessionIdsByUserId = new ConcurrentHashMap<>();
    private final Map<String, GalleryResumeState> resumeStates = new ConcurrentHashMap<>();

    GalleryPresenceRegistry(ObjectMapper objectMapper, int maxMessagesPerSecond) {
        this.objectMapper = objectMapper;
        this.maxMessagesPerSecond = maxMessagesPerSecond;
    }

    void register(WebSocketSession session) {
        String userId = "visitor-" + session.getId();
        sessions.put(session.getId(), session);
        visitors.put(session.getId(), GalleryVisitorPresence.initial(userId));
        messageRateLimiters.put(session.getId(), new GalleryMessageRateLimiter(maxMessagesPerSecond));
        lastActivityAt.put(session.getId(), Instant.now());
    }

    GalleryRateLimitDecision acquireRateLimit(WebSocketSession session) {
        return messageRateLimiters
                .computeIfAbsent(session.getId(), ignored -> new GalleryMessageRateLimiter(maxMessagesPerSecond))
                .acquire();
    }

    void touch(WebSocketSession session) {
        lastActivityAt.put(session.getId(), Instant.now());
    }

    GalleryVisitorPresence visitor(WebSocketSession session) {
        return visitors.get(session.getId());
    }

    GalleryVisitorPresence joinedVisitor(WebSocketSession session) {
        GalleryVisitorPresence visitor = visitor(session);
        return visitor != null && visitor.hallId() != null ? visitor : null;
    }

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

    JoinResult join(WebSocketSession session, Long requestedHallId, String clientId, com.fasterxml.jackson.databind.JsonNode root) {
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
                root,
                resumableVisitor
        );
        visitors.put(session.getId(), updated);
        sessionIdsByUserId.remove(previous.userId(), session.getId());
        sessionIdsByUserId.put(updated.userId(), session.getId());

        return new JoinResult(previous, updated, resumed);
    }

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

    GalleryVisitorPresence updateVoiceReady(WebSocketSession session, boolean voiceReady) {
        return visitors.computeIfPresent(
                session.getId(),
                (sessionId, visitor) -> visitor.withVoiceReady(voiceReady)
        );
    }

    GalleryVisitorPresence updateVoiceSpeaking(WebSocketSession session, boolean speaking) {
        return visitors.computeIfPresent(
                session.getId(),
                (sessionId, visitor) -> visitor.withVoiceSpeaking(speaking)
        );
    }

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

    void removeSession(WebSocketSession session) {
        removeSessionState(session.getId(), session, true, true);
    }

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

    boolean sendSafely(WebSocketSession session, Object payload) {
        try {
            send(session, payload);
            return true;
        } catch (IOException | RuntimeException exception) {
            removeFailedSession(session, exception);
            return false;
        }
    }

    void send(WebSocketSession session, Object payload) throws IOException {
        String json = objectMapper.writeValueAsString(payload);
        synchronized (session) {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(json));
            }
        }
    }

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

    private GalleryResumeState takeResumeState(String clientId, Instant now) {
        GalleryResumeState state = resumeStates.remove(clientId);
        return state != null && !state.expiresAt().isBefore(now) ? state : null;
    }

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

    private void removeOrphanedVisitor(String sessionId, GalleryVisitorPresence visitor) {
        if (visitors.get(sessionId) != visitor) {
            return;
        }
        removeSessionState(sessionId, null, true, true);
    }

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

    private String stableUserId(String clientId) {
        return "visitor-" + clientId;
    }

    record JoinResult(
            GalleryVisitorPresence previous,
            GalleryVisitorPresence updated,
            boolean resumed
    ) {
    }
}

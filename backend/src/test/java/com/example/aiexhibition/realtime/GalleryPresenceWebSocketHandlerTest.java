package com.example.aiexhibition.realtime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

class GalleryPresenceWebSocketHandlerTest {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    private final GalleryPresenceWebSocketHandler handler =
            new GalleryPresenceWebSocketHandler(objectMapper);

    @Test
    void includesExistingVoiceReadyStateWhenAnotherUserJoinsLater() throws Exception {
        List<String> firstUserMessages = new ArrayList<>();
        WebSocketSession firstUser = session("first-session", firstUserMessages);

        handler.afterConnectionEstablished(firstUser);
        handler.handleTextMessage(firstUser, jsonMessage("JOIN", 2L));
        handler.handleTextMessage(firstUser, new TextMessage("""
                {"type":"VOICE_READY"}
                """));

        List<String> secondUserMessages = new ArrayList<>();
        WebSocketSession secondUser = session("second-session", secondUserMessages);

        handler.afterConnectionEstablished(secondUser);
        handler.handleTextMessage(secondUser, jsonMessage("JOIN", 2L));

        JsonNode welcome = lastMessageOfType(secondUserMessages, "WELCOME");
        assertThat(welcome.path("users")).hasSize(1);
        assertThat(welcome.path("users").get(0).path("userId").asText())
                .isEqualTo("visitor-first-session");
        assertThat(welcome.path("users").get(0).path("voiceReady").asBoolean())
                .isTrue();
    }

    @Test
    void clearsStoredVoiceReadyStateWhenUserLeavesVoiceChat() throws Exception {
        WebSocketSession firstUser = session("first-session", new ArrayList<>());
        handler.afterConnectionEstablished(firstUser);
        handler.handleTextMessage(firstUser, jsonMessage("JOIN", 2L));
        handler.handleTextMessage(firstUser, new TextMessage("""
                {"type":"VOICE_READY"}
                """));
        handler.handleTextMessage(firstUser, new TextMessage("""
                {"type":"VOICE_NOT_READY"}
                """));

        List<String> secondUserMessages = new ArrayList<>();
        WebSocketSession secondUser = session("second-session", secondUserMessages);
        handler.afterConnectionEstablished(secondUser);
        handler.handleTextMessage(secondUser, jsonMessage("JOIN", 2L));

        JsonNode welcome = lastMessageOfType(secondUserMessages, "WELCOME");
        assertThat(welcome.path("users")).hasSize(1);
        assertThat(welcome.path("users").get(0).path("voiceReady").asBoolean())
                .isFalse();
    }

    private WebSocketSession session(String id, List<String> sentMessages) throws Exception {
        WebSocketSession session = mock(WebSocketSession.class);
        when(session.getId()).thenReturn(id);
        when(session.isOpen()).thenReturn(true);
        doAnswer(invocation -> {
            TextMessage message = invocation.getArgument(0);
            sentMessages.add(message.getPayload());
            return null;
        }).when(session).sendMessage(any(TextMessage.class));
        return session;
    }

    private TextMessage jsonMessage(String type, long hallId) {
        return new TextMessage("""
                {"type":"%s","hallId":%d}
                """.formatted(type, hallId));
    }

    private JsonNode lastMessageOfType(List<String> messages, String type) {
        return messages.stream()
                .map(this::readJson)
                .filter(message -> type.equals(message.path("type").asText()))
                .reduce((first, second) -> second)
                .orElseThrow();
    }

    private JsonNode readJson(String message) {
        try {
            return objectMapper.readTree(message);
        } catch (Exception exception) {
            throw new IllegalArgumentException("Failed to parse test message.", exception);
        }
    }
}

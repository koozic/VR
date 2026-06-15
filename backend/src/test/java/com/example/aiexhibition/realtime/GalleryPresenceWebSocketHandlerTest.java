package com.example.aiexhibition.realtime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.aiexhibition.hall.HallRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

class GalleryPresenceWebSocketHandlerTest {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    private final HallRepository hallRepository = mock(HallRepository.class);
    private final GalleryPresenceWebSocketHandler handler;

    GalleryPresenceWebSocketHandlerTest() {
        when(hallRepository.existsById(anyLong())).thenReturn(true);
        handler = new GalleryPresenceWebSocketHandler(objectMapper, hallRepository);
    }

    @Test
    void doesNotPlaceANewConnectionInHallOneBeforeJoin() throws Exception {
        List<String> hallOneMessages = new ArrayList<>();
        WebSocketSession hallOneUser = session("hall-one-session", hallOneMessages);
        handler.afterConnectionEstablished(hallOneUser);
        handler.handleTextMessage(hallOneUser, jsonMessage("JOIN", 1L));
        hallOneMessages.clear();

        List<String> newUserMessages = new ArrayList<>();
        WebSocketSession newUser = session("new-session", newUserMessages);
        handler.afterConnectionEstablished(newUser);

        assertThat(hallOneMessages).isEmpty();
        assertThat(newUserMessages).isEmpty();

        handler.handleTextMessage(newUser, jsonMessage("JOIN", 3L));

        assertThat(hallOneMessages).isEmpty();
        JsonNode welcome = lastMessageOfType(newUserMessages, "WELCOME");
        assertThat(welcome.path("users")).isEmpty();
    }

    @Test
    void rejectsMovementBeforeJoiningAHall() throws Exception {
        List<String> messages = new ArrayList<>();
        WebSocketSession user = session("waiting-session", messages);
        handler.afterConnectionEstablished(user);

        handler.handleTextMessage(user, jsonMessage("MOVE", 2L));

        JsonNode error = lastMessageOfType(messages, "ERROR");
        assertThat(error.path("message").asText()).isEqualTo("Join a hall before moving.");
    }

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

    @Test
    void rejectsJoiningAHallThatDoesNotExist() throws Exception {
        when(hallRepository.existsById(99L)).thenReturn(false);
        List<String> messages = new ArrayList<>();
        WebSocketSession user = session("unknown-hall-session", messages);
        handler.afterConnectionEstablished(user);

        handler.handleTextMessage(user, jsonMessage("JOIN", 99L));

        JsonNode error = lastMessageOfType(messages, "ERROR");
        assertThat(error.path("message").asText()).isEqualTo("Hall does not exist.");
    }

    @Test
    void rejectsCoordinatesOutsideTheSupportedRange() throws Exception {
        List<String> messages = new ArrayList<>();
        WebSocketSession user = session("invalid-position-session", messages);
        handler.afterConnectionEstablished(user);
        handler.handleTextMessage(user, jsonMessage("JOIN", 1L));
        messages.clear();

        handler.handleTextMessage(user, new TextMessage("""
                {"type":"MOVE","hallId":1,"x":1001,"y":1.6,"z":0,"yaw":0}
                """));

        JsonNode error = lastMessageOfType(messages, "ERROR");
        assertThat(error.path("message").asText()).isEqualTo("Invalid position or yaw value.");
    }

    @Test
    void continuesBroadcastingWhenOneReceiverFails() throws Exception {
        WebSocketSession sender = session("sender-session", new ArrayList<>());
        WebSocketSession brokenReceiver = session("broken-session", new ArrayList<>());
        List<String> healthyMessages = new ArrayList<>();
        WebSocketSession healthyReceiver = session("healthy-session", healthyMessages);

        handler.afterConnectionEstablished(sender);
        handler.afterConnectionEstablished(brokenReceiver);
        handler.afterConnectionEstablished(healthyReceiver);
        handler.handleTextMessage(sender, jsonMessage("JOIN", 1L));
        handler.handleTextMessage(brokenReceiver, jsonMessage("JOIN", 1L));
        handler.handleTextMessage(healthyReceiver, jsonMessage("JOIN", 1L));
        healthyMessages.clear();

        doThrow(new IOException("receiver disconnected"))
                .when(brokenReceiver)
                .sendMessage(any(TextMessage.class));

        assertDoesNotThrow(() -> handler.handleTextMessage(sender, new TextMessage("""
                {"type":"MOVE","hallId":1,"x":1,"y":1.6,"z":2,"yaw":0}
                """)));

        JsonNode moved = lastMessageOfType(healthyMessages, "USER_MOVED");
        assertThat(moved.path("user").path("userId").asText()).isEqualTo("visitor-sender-session");
        JsonNode left = lastMessageOfType(healthyMessages, "USER_LEFT");
        assertThat(left.path("userId").asText()).isEqualTo("visitor-broken-session");
    }

    @Test
    void limitsExcessiveMessagesFromOneSession() throws Exception {
        List<String> messages = new ArrayList<>();
        WebSocketSession user = session("fast-session", messages);
        handler.afterConnectionEstablished(user);
        handler.handleTextMessage(user, jsonMessage("JOIN", 1L));
        messages.clear();

        for (int index = 0; index < 125; index++) {
            handler.handleTextMessage(user, new TextMessage("""
                    {"type":"MOVE","hallId":1,"x":0,"y":1.6,"z":0,"yaw":0}
                    """));
        }

        JsonNode error = lastMessageOfType(messages, "ERROR");
        assertThat(error.path("message").asText())
                .isEqualTo("Too many websocket messages. Please slow down.");
    }

    @Test
    void respondsToHeartbeatPingWithPong() throws Exception {
        List<String> messages = new ArrayList<>();
        WebSocketSession user = session("heartbeat-session", messages);
        handler.afterConnectionEstablished(user);

        handler.handleTextMessage(user, new TextMessage("""
                {"type":"PING"}
                """));

        JsonNode pong = lastMessageOfType(messages, "PONG");
        assertThat(pong.path("timestamp").asText()).isNotBlank();
    }

    @Test
    void closesAWebSocketSessionThatStoppedSendingHeartbeats() throws Exception {
        WebSocketSession staleUser = session("stale-session", new ArrayList<>());
        handler.afterConnectionEstablished(staleUser);

        handler.removeStaleSessions(Instant.now().plusSeconds(121));

        verify(staleUser).close(org.springframework.web.socket.CloseStatus.SERVER_ERROR);
    }

    @Test
    void restoresStableUserIdAndPositionAfterReconnect() throws Exception {
        List<String> observerMessages = new ArrayList<>();
        WebSocketSession observer = session("observer-session", observerMessages);
        handler.afterConnectionEstablished(observer);
        handler.handleTextMessage(observer, jsonMessage("JOIN", 1L));
        observerMessages.clear();

        WebSocketSession original = session("original-session", new ArrayList<>());
        handler.afterConnectionEstablished(original);
        handler.handleTextMessage(original, new TextMessage("""
                {
                  "type":"JOIN",
                  "hallId":1,
                  "clientId":"browser-client-1234",
                  "x":4.5,
                  "y":1.6,
                  "z":-2,
                  "yaw":1.2
                }
                """));
        handler.afterConnectionClosed(original, org.springframework.web.socket.CloseStatus.NORMAL);
        observerMessages.clear();

        List<String> reconnectedMessages = new ArrayList<>();
        WebSocketSession reconnected = session("reconnected-session", reconnectedMessages);
        handler.afterConnectionEstablished(reconnected);
        handler.handleTextMessage(reconnected, new TextMessage("""
                {"type":"JOIN","hallId":1,"clientId":"browser-client-1234"}
                """));

        JsonNode welcome = lastMessageOfType(reconnectedMessages, "WELCOME");
        assertThat(welcome.path("userId").asText()).isEqualTo("visitor-browser-client-1234");
        assertThat(welcome.path("resumed").asBoolean()).isTrue();
        assertThat(welcome.path("self").path("x").asDouble()).isEqualTo(4.5);

        JsonNode joined = lastMessageOfType(observerMessages, "USER_JOINED");
        assertThat(joined.path("user").path("userId").asText())
                .isEqualTo("visitor-browser-client-1234");
        assertThat(joined.path("user").path("x").asDouble()).isEqualTo(4.5);
        assertThat(joined.path("user").path("z").asDouble()).isEqualTo(-2);
        assertThat(joined.path("user").path("yaw").asDouble()).isEqualTo(1.2);
    }

    @Test
    void broadcastsChatOnlyInsideTheJoinedHall() throws Exception {
        List<String> senderMessages = new ArrayList<>();
        List<String> receiverMessages = new ArrayList<>();
        List<String> otherHallMessages = new ArrayList<>();
        WebSocketSession sender = session("chat-sender", senderMessages);
        WebSocketSession receiver = session("chat-receiver", receiverMessages);
        WebSocketSession otherHall = session("other-hall", otherHallMessages);

        handler.afterConnectionEstablished(sender);
        handler.afterConnectionEstablished(receiver);
        handler.afterConnectionEstablished(otherHall);
        handler.handleTextMessage(sender, jsonMessage("JOIN", 1L));
        handler.handleTextMessage(receiver, jsonMessage("JOIN", 1L));
        handler.handleTextMessage(otherHall, jsonMessage("JOIN", 2L));
        senderMessages.clear();
        receiverMessages.clear();
        otherHallMessages.clear();

        handler.handleTextMessage(sender, new TextMessage("""
                {"type":"CHAT","message":"같이 전시를 봐요"}
                """));

        JsonNode senderChat = lastMessageOfType(senderMessages, "CHAT_MESSAGE");
        JsonNode receiverChat = lastMessageOfType(receiverMessages, "CHAT_MESSAGE");
        assertThat(senderChat.path("message").asText()).isEqualTo("같이 전시를 봐요");
        assertThat(receiverChat.path("userId").asText()).isEqualTo("visitor-chat-sender");
        assertThat(otherHallMessages).isEmpty();
    }

    @Test
    void broadcastsOnlyAllowedEmotes() throws Exception {
        List<String> senderMessages = new ArrayList<>();
        List<String> receiverMessages = new ArrayList<>();
        WebSocketSession sender = session("emote-sender", senderMessages);
        WebSocketSession receiver = session("emote-receiver", receiverMessages);

        handler.afterConnectionEstablished(sender);
        handler.afterConnectionEstablished(receiver);
        handler.handleTextMessage(sender, jsonMessage("JOIN", 1L));
        handler.handleTextMessage(receiver, jsonMessage("JOIN", 1L));
        senderMessages.clear();
        receiverMessages.clear();

        handler.handleTextMessage(sender, new TextMessage("""
                {"type":"EMOTE","emote":"WAVE"}
                """));

        JsonNode received = lastMessageOfType(receiverMessages, "EMOTE_RECEIVED");
        assertThat(received.path("emote").asText()).isEqualTo("WAVE");

        handler.handleTextMessage(sender, new TextMessage("""
                {"type":"EMOTE","emote":"DANCE"}
                """));
        JsonNode error = lastMessageOfType(senderMessages, "ERROR");
        assertThat(error.path("message").asText()).isEqualTo("Unsupported emote.");
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

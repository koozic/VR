package com.example.aiexhibition.realtime;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;
import java.util.Objects;

/**
 * WebSocket에 접속한 관람객 한 명의 현재 상태를 담는 record다.
 */
record GalleryVisitorPresence(
        // 화면에서 사용자를 구분하는 안정적인 ID다.
        String userId,
        // 현재 들어가 있는 전시관 ID다. null이면 아직 JOIN 전이다.
        Long hallId,
        // 현재 WebSocket 접속 동안만 쓰는 표시 이름이다.
        String nickname,
        // 현재 WebSocket 접속 동안만 쓰는 선택 캐릭터 ID다.
        String characterId,
        // Three.js 공간의 x 좌표다.
        double x,
        // Three.js 공간의 y 좌표다.
        double y,
        // Three.js 공간의 z 좌표다.
        double z,
        // 캐릭터가 바라보는 방향이다.
        double yaw,
        // 사용자가 음성 채팅에 참여 중인지 나타낸다.
        boolean voiceReady,
        // 사용자가 현재 말하고 있는지 나타낸다.
        boolean voiceSpeaking,
        // 이 상태가 마지막으로 갱신된 시각이다.
        Instant updatedAt
) {
    // 연결 직후 아직 전시관에 입장하지 않은 기본 상태를 만든다.
    static GalleryVisitorPresence initial(String userId) {
        return new GalleryVisitorPresence(
                userId,
                null,
                defaultNickname(userId),
                null,
                0,
                1.6,
                8.2,
                0,
                false,
                false,
                Instant.now()
        );
    }

    // JOIN 메시지를 받았을 때 전시관 입장 상태로 갱신한다.
    GalleryVisitorPresence join(
            String requestedUserId,
            Long requestedHallId,
            String requestedNickname,
            String requestedCharacterId,
            JsonNode root,
            GalleryVisitorPresence resumableVisitor
    ) {
        GalleryVisitorPresence fallback;
        // 같은 전시관으로 재접속하면 이전 좌표를 우선 복구한다.
        if (resumableVisitor != null && Objects.equals(resumableVisitor.hallId, requestedHallId)) {
            fallback = resumableVisitor;
        } else if (Objects.equals(hallId, requestedHallId)) {
            fallback = this;
        } else {
            fallback = GalleryVisitorPresence.initial(requestedUserId);
        }
        return new GalleryVisitorPresence(
                requestedUserId,
                requestedHallId,
                requestedNickname != null ? requestedNickname : fallback.nickname,
                requestedCharacterId != null ? requestedCharacterId : fallback.characterId,
                readDouble(root, "x", fallback.x),
                readDouble(root, "y", fallback.y),
                readDouble(root, "z", fallback.z),
                readDouble(root, "yaw", fallback.yaw),
                false,
                false,
                Instant.now()
        );
    }

    // MOVE 메시지를 받았을 때 좌표와 방향만 갱신한다.
    GalleryVisitorPresence move(JsonNode root) {
        return new GalleryVisitorPresence(
                userId,
                hallId,
                nickname,
                characterId,
                readDouble(root, "x", x),
                readDouble(root, "y", y),
                readDouble(root, "z", z),
                readDouble(root, "yaw", yaw),
                voiceReady,
                voiceSpeaking,
                Instant.now()
        );
    }

    // 음성 채팅 참여/해제 상태를 바꾼다. 해제되면 말하는 상태도 함께 꺼진다.
    GalleryVisitorPresence withVoiceReady(boolean ready) {
        return new GalleryVisitorPresence(
                userId,
                hallId,
                nickname,
                characterId,
                x,
                y,
                z,
                yaw,
                ready,
                ready && voiceSpeaking,
                Instant.now()
        );
    }

    // 말하는 중 표시를 바꾼다. 음성 채팅에 들어와 있을 때만 true가 유지된다.
    GalleryVisitorPresence withVoiceSpeaking(boolean speaking) {
        return new GalleryVisitorPresence(
                userId,
                hallId,
                nickname,
                characterId,
                x,
                y,
                z,
                yaw,
                voiceReady,
                voiceReady && speaking,
                Instant.now()
        );
    }

    // JSON에 숫자 필드가 있으면 읽고, 없으면 기존 값을 그대로 사용한다.
    private static double readDouble(JsonNode root, String field, double fallback) {
        JsonNode value = root.get(field);
        return value != null && value.isNumber() ? value.asDouble() : fallback;
    }

    private static String defaultNickname(String userId) {
        String suffix = String.valueOf(userId).replace("visitor-", "");
        if (suffix.length() > 6) {
            suffix = suffix.substring(suffix.length() - 6);
        }
        return suffix.isBlank() ? "Visitor" : "Visitor " + suffix;
    }
}

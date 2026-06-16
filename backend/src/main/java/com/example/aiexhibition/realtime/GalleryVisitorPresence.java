package com.example.aiexhibition.realtime;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;
import java.util.Objects;

record GalleryVisitorPresence(
        String userId,
        Long hallId,
        double x,
        double y,
        double z,
        double yaw,
        boolean voiceReady,
        boolean voiceSpeaking,
        Instant updatedAt
) {
    static GalleryVisitorPresence initial(String userId) {
        return new GalleryVisitorPresence(userId, null, 0, 1.6, 8.2, 0, false, false, Instant.now());
    }

    GalleryVisitorPresence join(
            String requestedUserId,
            Long requestedHallId,
            JsonNode root,
            GalleryVisitorPresence resumableVisitor
    ) {
        GalleryVisitorPresence fallback;
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
                readDouble(root, "x", fallback.x),
                readDouble(root, "y", fallback.y),
                readDouble(root, "z", fallback.z),
                readDouble(root, "yaw", fallback.yaw),
                false,
                false,
                Instant.now()
        );
    }

    GalleryVisitorPresence move(JsonNode root) {
        return new GalleryVisitorPresence(
                userId,
                hallId,
                readDouble(root, "x", x),
                readDouble(root, "y", y),
                readDouble(root, "z", z),
                readDouble(root, "yaw", yaw),
                voiceReady,
                voiceSpeaking,
                Instant.now()
        );
    }

    GalleryVisitorPresence withVoiceReady(boolean ready) {
        return new GalleryVisitorPresence(
                userId,
                hallId,
                x,
                y,
                z,
                yaw,
                ready,
                ready && voiceSpeaking,
                Instant.now()
        );
    }

    GalleryVisitorPresence withVoiceSpeaking(boolean speaking) {
        return new GalleryVisitorPresence(
                userId,
                hallId,
                x,
                y,
                z,
                yaw,
                voiceReady,
                voiceReady && speaking,
                Instant.now()
        );
    }

    private static double readDouble(JsonNode root, String field, double fallback) {
        JsonNode value = root.get(field);
        return value != null && value.isNumber() ? value.asDouble() : fallback;
    }
}

package com.example.aiexhibition.realtime;

import java.time.Instant;

record GalleryResumeState(
        GalleryVisitorPresence visitor,
        Instant expiresAt
) {
}

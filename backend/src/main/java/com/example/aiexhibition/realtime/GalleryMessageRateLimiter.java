package com.example.aiexhibition.realtime;

final class GalleryMessageRateLimiter {

    private static final long WINDOW_NANOS = 1_000_000_000L;

    private final int maxMessagesPerSecond;
    private long windowStartedAt = System.nanoTime();
    private int messageCount;
    private boolean warningSent;

    GalleryMessageRateLimiter(int maxMessagesPerSecond) {
        this.maxMessagesPerSecond = maxMessagesPerSecond;
    }

    synchronized GalleryRateLimitDecision acquire() {
        long now = System.nanoTime();
        if (now - windowStartedAt >= WINDOW_NANOS) {
            windowStartedAt = now;
            messageCount = 0;
            warningSent = false;
        }

        messageCount++;
        if (messageCount <= maxMessagesPerSecond) {
            return GalleryRateLimitDecision.ALLOW;
        }
        if (!warningSent) {
            warningSent = true;
            return GalleryRateLimitDecision.REJECT_AND_WARN;
        }
        return GalleryRateLimitDecision.REJECT;
    }
}

package com.example.aiexhibition.realtime;

/**
 * 한 WebSocket 세션이 1초에 보낼 수 있는 메시지 수를 제한하는 작은 안전장치다.
 */
final class GalleryMessageRateLimiter {

    // 제한 시간을 1초 단위로 계산하기 위한 나노초 값이다.
    private static final long WINDOW_NANOS = 1_000_000_000L;

    // 세션 한 개가 1초에 보낼 수 있는 최대 메시지 수다.
    private final int maxMessagesPerSecond;
    // 현재 카운트 창이 시작된 시각이다.
    private long windowStartedAt = System.nanoTime();
    // 현재 1초 창에서 받은 메시지 수다.
    private int messageCount;
    // 같은 1초 안에서 경고를 여러 번 보내지 않기 위한 표시다.
    private boolean warningSent;

    GalleryMessageRateLimiter(int maxMessagesPerSecond) {
        this.maxMessagesPerSecond = maxMessagesPerSecond;
    }

    // 메시지 하나를 받을 때마다 호출해서 처리 가능/거절/경고 여부를 결정한다.
    synchronized GalleryRateLimitDecision acquire() {
        long now = System.nanoTime();
        // 1초가 지났으면 카운트를 새 창으로 초기화한다.
        if (now - windowStartedAt >= WINDOW_NANOS) {
            windowStartedAt = now;
            messageCount = 0;
            warningSent = false;
        }

        messageCount++;
        if (messageCount <= maxMessagesPerSecond) {
            return GalleryRateLimitDecision.ALLOW;
        }
        // 제한을 처음 넘긴 순간에는 프런트에 한 번만 경고를 보낸다.
        if (!warningSent) {
            warningSent = true;
            return GalleryRateLimitDecision.REJECT_AND_WARN;
        }
        return GalleryRateLimitDecision.REJECT;
    }
}

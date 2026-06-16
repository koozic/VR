package com.example.aiexhibition.realtime;

// 사용자가 1초에 너무 많은 WebSocket 메시지를 보낼 때 처리 방향을 나타낸다.
enum GalleryRateLimitDecision {
    // 정상 처리한다.
    ALLOW,
    // 조용히 무시한다.
    REJECT,
    // 이번에는 경고 메시지를 한 번 보내고 무시한다.
    REJECT_AND_WARN
}

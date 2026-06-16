package com.example.aiexhibition.realtime;

import java.time.Instant;

// 사용자가 새로고침/재접속했을 때 잠깐 이전 위치와 상태를 복구하기 위한 임시 기록이다.
record GalleryResumeState(
        // 끊기기 직전의 관람객 위치/음성 상태다.
        GalleryVisitorPresence visitor,
        // 이 시각이 지나면 복구 기록을 버린다.
        Instant expiresAt
) {
}

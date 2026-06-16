package com.example.aiexhibition.history.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

// 관람 기록 생성 API가 받는 요청 DTO다.
public record ViewHistoryCreateRequest(
        // 어떤 방문자의 기록인지 반드시 알려줘야 하므로 양수 ID만 허용한다.
        @NotNull
        @Positive
        Long visitorId,

        // 어떤 작품을 본 기록인지 반드시 알려줘야 하므로 양수 ID만 허용한다.
        @NotNull
        @Positive
        Long exhibitId,

        // 작품을 본 시간은 0초 이상이어야 한다.
        @NotNull
        @PositiveOrZero
        Integer durationSeconds
) {
}

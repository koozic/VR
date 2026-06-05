package com.example.aiexhibition.history.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record ViewHistoryCreateRequest(
        @NotNull
        @Positive
        Long visitorId,

        @NotNull
        @Positive
        Long exhibitId,

        @NotNull
        @PositiveOrZero
        Integer durationSeconds
) {
}

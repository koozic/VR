package com.example.aiexhibition.exhibit.dto;

import jakarta.validation.constraints.NotNull;

public record ExhibitPositionUpdateRequest(
        @NotNull
        Double positionX,

        @NotNull
        Double positionY,

        @NotNull
        Double positionZ
) {
}

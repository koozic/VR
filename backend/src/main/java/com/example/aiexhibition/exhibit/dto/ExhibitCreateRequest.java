package com.example.aiexhibition.exhibit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ExhibitCreateRequest(
        @NotBlank
        @Size(max = 200)
        String title,

        @Size(max = 100)
        String creator,

        String description,

        @NotNull
        @Positive
        Long hallId,

        @NotNull
        Double positionX,

        @NotNull
        Double positionY,

        @NotNull
        Double positionZ
) {
}

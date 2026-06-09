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

        @Size(max = 1000)
        String exampleText,

        // Display settings
        @Size(max = 50)
        String type,

        @Size(max = 500)
        String contentUrl,

        Integer wallIndex,

        Double rotationY,

        Double scale,

        Boolean wide,

        @Size(max = 500)
        String thumbnailUrl,

        // Portal settings
        Double portalTargetX,

        Double portalTargetZ,

        Double portalTargetYaw,

        // Hall and 3D position
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

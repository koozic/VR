package com.example.aiexhibition.ai.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;

public record AiExplainRequest(
        @JsonProperty("artworkId") @JsonAlias("exhibitId") Long exhibitId,
        @Size(max = 200) String title,
        @JsonProperty("artistName") @JsonAlias("creator") String creator,
        String description,
        @Size(max = 10) List<@Size(max = 100) String> keywords,
        @Size(max = 1000) String exampleText,
        @Size(max = 300) String userQuestion,
        @Valid UserPosition userPosition,
        @Positive Long hallId,
        @Positive Double maxDistance
) {
    public record UserPosition(
            @NotNull Double x,
            @NotNull Double y,
            @NotNull Double z
    ) {
    }
}



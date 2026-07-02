package com.example.aiexhibition.ai.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;

public record VoiceDocentQuestionRequest(
        @Positive @JsonProperty("artworkId") @JsonAlias("exhibitId") Long exhibitId,
        @Size(max = 200) String title,
        @Size(max = 200) @JsonProperty("artistName") @JsonAlias("creator") String creator,
        @Size(max = 1000) String description,
        @Size(max = 10) List<@Size(max = 100) String> keywords,
        @Size(max = 1000) String exampleText,
        @Size(max = 12000) String docentContext,
        @Size(max = 300) String userQuestion,
        @Valid UserPosition userPosition,
        @Positive Long hallId,
        @Positive Double maxDistance
) {
    @JsonIgnore
    @AssertTrue(message = "artworkId, title, or userPosition must be provided")
    public boolean isArtworkTargetProvided() {
        return exhibitId != null || hasText(title) || userPosition != null;
    }

    @JsonIgnore
    @AssertTrue(message = "hallId is required when userPosition is provided")
    public boolean isHallProvidedForPosition() {
        return userPosition == null || hallId != null;
    }

    public AiExplainRequest toAiExplainRequest() {
        return new AiExplainRequest(
                exhibitId,
                title,
                creator,
                description,
                keywords,
                exampleText,
                docentContext,
                userQuestion,
                userPosition == null
                        ? null
                        : new AiExplainRequest.UserPosition(
                                userPosition.x(),
                                userPosition.y(),
                                userPosition.z()
                        ),
                hallId,
                maxDistance
        );
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    public record UserPosition(
            @NotNull Double x,
            @NotNull Double y,
            @NotNull Double z
    ) {
    }
}

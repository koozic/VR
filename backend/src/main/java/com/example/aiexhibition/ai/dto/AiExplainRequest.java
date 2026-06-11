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

/**
 * 프런트엔드가 백엔드에 보내고, 백엔드가 FastAPI에 다시 전달하는 AI 설명 요청 DTO.
 * 좌표가 있으면 백엔드가 가장 가까운 작품을 찾아 작품 정보를 채운다.
 */
public record AiExplainRequest(
        // artworkId가 기본 JSON 이름이고 exhibitId도 이전 호환 이름으로 허용한다.
        @Positive @JsonProperty("artworkId") @JsonAlias("exhibitId") Long exhibitId,
        @Size(max = 200) String title,
        @Size(max = 200) @JsonProperty("artistName") @JsonAlias("creator") String creator,
        @Size(max = 1000) String description,
        @Size(max = 10) List<@Size(max = 100) String> keywords,
        @Size(max = 1000) String exampleText,
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

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    /**
     * Three.js 공간에서 관람객의 현재 위치를 나타낸다.
     */
    public record UserPosition(
            @NotNull Double x,
            @NotNull Double y,
            @NotNull Double z
    ) {
    }
}



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
        // 작품 ID. JSON에서는 artworkId를 기본 이름으로 쓰고 exhibitId도 호환한다.
        @Positive @JsonProperty("artworkId") @JsonAlias("exhibitId") Long exhibitId,
        // 작품 기본 정보. ID 없이 제목과 설명을 직접 보내는 요청에서도 사용한다.
        @Size(max = 200) String title,
        @Size(max = 200) @JsonProperty("artistName") @JsonAlias("creator") String creator,
        @Size(max = 1000) String description,
        // AI가 작품의 핵심 특징과 설명 말투를 참고할 보조 정보다.
        @Size(max = 10) List<@Size(max = 100) String> keywords,
        @Size(max = 1000) String exampleText,
        // 관람객이 작품에 대해 입력하거나 음성인식으로 전달한 질문이다.
        @Size(max = 300) String userQuestion,
        // 좌표 요청이면 Spring이 같은 전시관에서 가장 가까운 작품을 찾는다.
        @Valid UserPosition userPosition,
        @Positive Long hallId,
        @Positive Double maxDistance
) {
    // ID, 제목, 위치 중 하나도 없으면 어떤 작품을 설명할지 결정할 수 없다.
    @JsonIgnore
    @AssertTrue(message = "artworkId, title, or userPosition must be provided")
    public boolean isArtworkTargetProvided() {
        return exhibitId != null || hasText(title) || userPosition != null;
    }

    // 좌표는 전시관마다 기준이 같을 수 있으므로 위치 요청에는 hallId가 필요하다.
    @JsonIgnore
    @AssertTrue(message = "hallId is required when userPosition is provided")
    public boolean isHallProvidedForPosition() {
        return userPosition == null || hallId != null;
    }

    // null, 빈 문자열, 공백뿐인 문자열을 실제 제목으로 인정하지 않는다.
    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    /**
     * Three.js 공간에서 관람객의 현재 위치를 나타낸다.
     */
    public record UserPosition(
            // Double을 사용해 누락된 좌표를 null로 구분하고 @NotNull로 검증한다.
            @NotNull Double x,
            @NotNull Double y,
            @NotNull Double z
    ) {
    }
}



package com.example.aiexhibition.exhibit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

// 작품 생성 API가 받는 요청 DTO다.
public record ExhibitCreateRequest(
        // 작품 제목은 필수이고, 화면/DB 저장을 위해 최대 길이를 제한한다.
        @NotBlank
        @Size(max = 200)
        String title,

        // 작가명은 선택값이지만 너무 길어지지 않게 제한한다.
        @Size(max = 100)
        String creator,

        // 작품 설명과 AI 예시 문장은 긴 텍스트지만 무제한 입력은 막는다.
        String description,

        @Size(max = 1000)
        String exampleText,

        // 3D 갤러리에서 작품을 어떤 방식으로 표시할지 정하는 설정이다.
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

        // portal 타입 작품일 때 이동 목표 위치와 바라보는 방향을 저장한다.
        Double portalTargetX,

        Double portalTargetZ,

        Double portalTargetYaw,

        // 작품이 속한 전시관과 Three.js 공간 좌표다.
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

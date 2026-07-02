package com.example.aiexhibition.exhibit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

// 작품 수정 API가 받는 요청 DTO다. 생성 DTO와 거의 같은 모양으로 전체 수정을 처리한다.
public record ExhibitUpdateRequest(
        // 수정 시에도 제목은 필수다.
        @NotBlank
        @Size(max = 200)
        String title,

        @Size(max = 100)
        String creator,

        String description,

        @Size(max = 1000)
        String exampleText,

        String docentContext,

        // 3D 갤러리 표시 방식과 리소스 URL 설정이다.
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

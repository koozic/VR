package com.example.aiexhibition.exhibit.dto;

import jakarta.validation.constraints.NotNull;

// 작품의 3D 좌표만 따로 수정할 때 사용하는 요청 DTO다.
public record ExhibitPositionUpdateRequest(
        // Three.js 공간에서 X, Y, Z 좌표가 모두 있어야 정확한 위치를 저장할 수 있다.
        @NotNull
        Double positionX,

        @NotNull
        Double positionY,

        @NotNull
        Double positionZ
) {
}

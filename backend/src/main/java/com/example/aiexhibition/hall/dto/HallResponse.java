package com.example.aiexhibition.hall.dto;

import com.example.aiexhibition.exhibit.dto.ExhibitResponse;
import com.example.aiexhibition.hall.Hall;

import java.util.List;

// 전시관 정보와 전시관 안 작품 목록을 프런트엔드에 전달하는 응답 DTO다.
public record HallResponse(
        Long id,
        String name,
        String description,
        Double cameraY,
        String wallColor,
        String floorColor,
        String ceilingColor,
        String ambientLightColor,
        Double lightIntensity,
        List<ExhibitResponse> exhibits
) {
    public static HallResponse from(Hall hall) {
        // 작품 목록이 필요 없는 화면에서는 빈 목록으로 전시관 기본 정보만 반환한다.
        return new HallResponse(
                hall.getId(), hall.getName(), hall.getDescription(),
                hall.getCameraY(), hall.getWallColor(), hall.getFloorColor(),
                hall.getCeilingColor(), hall.getAmbientLightColor(), hall.getLightIntensity(),
                List.of()
        );
    }

    public static HallResponse from(Hall hall, List<ExhibitResponse> exhibits) {
        // 전시관 상세나 목록 화면에서 작품 목록까지 함께 내려줄 때 사용한다.
        return new HallResponse(
                hall.getId(), hall.getName(), hall.getDescription(),
                hall.getCameraY(), hall.getWallColor(), hall.getFloorColor(),
                hall.getCeilingColor(), hall.getAmbientLightColor(), hall.getLightIntensity(),
                exhibits
        );
    }
}


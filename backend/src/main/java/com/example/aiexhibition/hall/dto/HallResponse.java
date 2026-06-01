package com.example.aiexhibition.hall.dto;

import com.example.aiexhibition.exhibit.dto.ExhibitResponse;
import com.example.aiexhibition.hall.Hall;

import java.util.List;

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
        return new HallResponse(
                hall.getId(), hall.getName(), hall.getDescription(),
                hall.getCameraY(), hall.getWallColor(), hall.getFloorColor(),
                hall.getCeilingColor(), hall.getAmbientLightColor(), hall.getLightIntensity(),
                List.of()
        );
    }

    public static HallResponse from(Hall hall, List<ExhibitResponse> exhibits) {
        return new HallResponse(
                hall.getId(), hall.getName(), hall.getDescription(),
                hall.getCameraY(), hall.getWallColor(), hall.getFloorColor(),
                hall.getCeilingColor(), hall.getAmbientLightColor(), hall.getLightIntensity(),
                exhibits
        );
    }
}


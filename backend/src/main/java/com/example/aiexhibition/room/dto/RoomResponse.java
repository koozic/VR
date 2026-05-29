package com.example.aiexhibition.room.dto;

import com.example.aiexhibition.artwork.dto.ArtworkResponse;
import com.example.aiexhibition.room.Room;

import java.util.List;

public record RoomResponse(
        Long id,
        String name,
        String description,
        Double cameraY,
        String wallColor,
        String floorColor,
        String ceilingColor,
        String ambientLightColor,
        Double lightIntensity,
        List<ArtworkResponse> exhibits
) {
    public static RoomResponse from(Room room, List<ArtworkResponse> exhibits) {
        return new RoomResponse(
                room.getId(),
                room.getName(),
                room.getDescription(),
                room.getCameraY(),
                room.getWallColor(),
                room.getFloorColor(),
                room.getCeilingColor(),
                room.getAmbientLightColor(),
                room.getLightIntensity(),
                exhibits
        );
    }
}

package com.example.aiexhibition.room.dto;

import com.example.aiexhibition.room.Room;

public record RoomResponse(
        Long id,
        String name,
        String description
) {
    public static RoomResponse from(Room room) {
        return new RoomResponse(room.getId(), room.getName(), room.getDescription());
    }
}


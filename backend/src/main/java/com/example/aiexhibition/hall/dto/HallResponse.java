package com.example.aiexhibition.hall.dto;

import com.example.aiexhibition.hall.Hall;

public record HallResponse(
        Long id,
        String name,
        String description
) {
    public static HallResponse from(Hall hall) {
        return new HallResponse(hall.getId(), hall.getName(), hall.getDescription());
    }
}


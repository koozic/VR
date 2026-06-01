package com.example.aiexhibition.exhibit.dto;

import com.example.aiexhibition.exhibit.Exhibit;
import com.example.aiexhibition.exhibit.ExhibitPosition;

public record ExhibitResponse(
        Long id,
        String title,
        String creator,
        String description,
        Long hallId,
        Double positionX,
        Double positionY,
        Double positionZ
) {
    public static ExhibitResponse from(Exhibit exhibit) {
        Long hallId = exhibit.getHall() == null ? null : exhibit.getHall().getId();
        ExhibitPosition position = exhibit.getPosition();

        return new ExhibitResponse(
                exhibit.getId(),
                exhibit.getTitle(),
                exhibit.getCreator(),
                exhibit.getDescription(),
                hallId,
                position == null ? null : position.getPosX(),
                position == null ? null : position.getPosY(),
                position == null ? null : position.getPosZ()
        );
    }
}


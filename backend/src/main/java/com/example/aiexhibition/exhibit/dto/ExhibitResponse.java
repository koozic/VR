package com.example.aiexhibition.exhibit.dto;

import com.example.aiexhibition.exhibit.Exhibit;
import com.example.aiexhibition.exhibit.ExhibitPosition;
import java.util.List;

// 작품 상세/목록 API가 프런트엔드에 반환하는 응답 DTO다.
public record ExhibitResponse(
        Long id,
        String title,
        String creator,
        String description,
        List<String> keywords,
        String exampleText,
        String docentContext,
        Long hallId,
        Double positionX,
        Double positionY,
        Double positionZ,
        String type,
        String contentUrl,
        Integer wallIndex,
        Double rotationY,
        Double scale,
        Boolean wide,
        String thumbnailUrl,
        Double portalTargetX,
        Double portalTargetZ,
        Double portalTargetYaw
) {
    public static ExhibitResponse from(Exhibit exhibit, List<String> keywords) {
        // Entity 관계에서 화면에 필요한 전시관 ID와 좌표만 안전하게 꺼낸다.
        Long hallId = exhibit.getHall() == null ? null : exhibit.getHall().getId();
        ExhibitPosition position = exhibit.getPosition();

        return new ExhibitResponse(
                exhibit.getId(),
                exhibit.getTitle(),
                exhibit.getCreator(),
                exhibit.getDescription(),
                keywords,
                exhibit.getExampleText(),
                exhibit.getDocentContext(),
                hallId,
                position == null ? null : position.getPosX(),
                position == null ? null : position.getPosY(),
                position == null ? null : position.getPosZ(),
                exhibit.getType(),
                exhibit.getContentUrl(),
                exhibit.getWallIndex(),
                exhibit.getRotationY(),
                exhibit.getScale(),
                exhibit.getWide(),
                exhibit.getThumbnailUrl(),
                exhibit.getPortalTargetX(),
                exhibit.getPortalTargetZ(),
                exhibit.getPortalTargetYaw()
        );
    }
}


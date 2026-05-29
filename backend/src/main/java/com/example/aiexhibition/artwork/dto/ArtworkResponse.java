package com.example.aiexhibition.artwork.dto;

import com.example.aiexhibition.artwork.Artwork;

public record ArtworkResponse(
        Long id,
        String title,
        String artistName,
        Integer year,
        String imageUrl,
        String description,
        Long roomId,
        String type,
        String contentUrl,
        Integer wallIndex,
        Double posX,
        Double posY,
        Double posZ,
        Double rotationY,
        Double scale,
        Boolean wide,
        String thumbnailUrl,
        Double portalTargetX,
        Double portalTargetZ,
        Double portalTargetYaw
) {
    public static ArtworkResponse from(Artwork artwork) {
        String artistName = artwork.getArtist() == null ? null : artwork.getArtist().getName();
        Long roomId = artwork.getRoom() == null ? null : artwork.getRoom().getId();

        return new ArtworkResponse(
                artwork.getId(),
                artwork.getTitle(),
                artistName,
                artwork.getYear(),
                artwork.getImageUrl(),
                artwork.getDescription(),
                roomId,
                artwork.getType(),
                artwork.getContentUrl(),
                artwork.getWallIndex(),
                artwork.getPosX(),
                artwork.getPosY(),
                artwork.getPosZ(),
                artwork.getRotationY(),
                artwork.getScale(),
                artwork.getWide(),
                artwork.getThumbnailUrl(),
                artwork.getPortalTargetX(),
                artwork.getPortalTargetZ(),
                artwork.getPortalTargetYaw()
        );
    }
}

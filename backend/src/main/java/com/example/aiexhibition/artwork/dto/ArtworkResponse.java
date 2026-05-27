package com.example.aiexhibition.artwork.dto;

import com.example.aiexhibition.artwork.Artwork;

public record ArtworkResponse(
        Long id,
        String title,
        String artistName,
        Integer year,
        String imageUrl,
        String description,
        Long roomId
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
                roomId
        );
    }
}


package com.example.aiexhibition.artwork;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ArtworkRepository extends JpaRepository<Artwork, Long> {
    java.util.List<Artwork> findByRoomId(Long roomId);
}


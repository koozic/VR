package com.example.aiexhibition.artwork;

import com.example.aiexhibition.artwork.dto.ArtworkResponse;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ArtworkService {

    private final ArtworkRepository artworkRepository;

    public ArtworkService(@NonNull ArtworkRepository artworkRepository) {
        this.artworkRepository = artworkRepository;
    }

    public List<ArtworkResponse> findAll() {
        return artworkRepository.findAll().stream()
                .map(ArtworkResponse::from)
                .toList();
    }

    public ArtworkResponse findById(@NonNull Long id) {
        return artworkRepository.findById(id)
                .map(ArtworkResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("Artwork not found: " + id));
    }

    public List<ArtworkResponse> findByRoomId(@NonNull Long roomId) {
        return artworkRepository.findByRoomId(roomId).stream()
                .map(ArtworkResponse::from)
                .toList();
    }
}


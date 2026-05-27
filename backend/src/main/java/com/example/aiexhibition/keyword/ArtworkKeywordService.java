package com.example.aiexhibition.keyword;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ArtworkKeywordService {

    private final ArtworkKeywordRepository artworkKeywordRepository;

    public ArtworkKeywordService(ArtworkKeywordRepository artworkKeywordRepository) {
        this.artworkKeywordRepository = artworkKeywordRepository;
    }

    public List<String> findKeywordsByArtworkId(Long artworkId) {
        return artworkKeywordRepository.findByArtworkId(artworkId).stream()
                .map(ArtworkKeyword::getKeyword)
                .toList();
    }
}


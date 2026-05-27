package com.example.aiexhibition.keyword;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ArtworkKeywordRepository extends JpaRepository<ArtworkKeyword, Long> {

    List<ArtworkKeyword> findByArtworkId(Long artworkId);
}


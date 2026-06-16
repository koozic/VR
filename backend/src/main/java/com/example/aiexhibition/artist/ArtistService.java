package com.example.aiexhibition.artist;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ArtistService {

    // Artist 테이블 조회를 Spring Data JPA Repository에 위임한다.
    private final ArtistRepository artistRepository;

    public ArtistService(ArtistRepository artistRepository) {
        this.artistRepository = artistRepository;
    }

    public List<Artist> findAll() {
        // 현재 작가 기능은 전체 목록 조회만 제공한다.
        return artistRepository.findAll();
    }
}


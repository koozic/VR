package com.example.aiexhibition.artist;

import org.springframework.data.jpa.repository.JpaRepository;

// 작가 엔티티의 기본 CRUD를 Spring Data JPA가 자동으로 만들어 주는 Repository다.
public interface ArtistRepository extends JpaRepository<Artist, Long> {
}


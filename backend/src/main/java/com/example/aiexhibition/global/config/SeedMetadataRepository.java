package com.example.aiexhibition.global.config;

import org.springframework.data.jpa.repository.JpaRepository;

// SEED_METADATA 테이블을 조회/저장하는 Spring Data JPA 저장소다.
public interface SeedMetadataRepository extends JpaRepository<SeedMetadata, String> {
}

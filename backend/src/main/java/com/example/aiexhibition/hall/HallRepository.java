package com.example.aiexhibition.hall;

import org.springframework.data.jpa.repository.JpaRepository;

// 전시관 엔티티의 기본 CRUD를 Spring Data JPA가 자동으로 만들어 주는 Repository다.
public interface HallRepository extends JpaRepository<Hall, Long> {
}


package com.example.aiexhibition.visitor;

import org.springframework.data.jpa.repository.JpaRepository;

// Visitor 엔티티의 기본 CRUD를 Spring Data JPA가 자동으로 만들어 주는 Repository다.
public interface VisitorRepository extends JpaRepository<Visitor, Long> {
}


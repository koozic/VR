package com.example.aiexhibition.history;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// 관람 기록을 DB에서 조회하는 Repository다.
public interface ViewHistoryRepository extends JpaRepository<ViewHistory, Long> {

    // 응답 DTO 변환 때 visitor/exhibit 정보가 필요하므로 EntityGraph로 한 번에 같이 읽는다.
    @EntityGraph(attributePaths = {"visitor", "exhibit"})
    List<ViewHistory> findAll();

    // 단건 조회도 방문자/작품 정보를 함께 가져와 LAZY 추가 조회를 줄인다.
    @EntityGraph(attributePaths = {"visitor", "exhibit"})
    Optional<ViewHistory> findById(Long id);

    // visitor.id 기준으로 관람 기록을 찾는다.
    @EntityGraph(attributePaths = {"visitor", "exhibit"})
    List<ViewHistory> findByVisitorId(Long visitorId);

    // exhibit.id 기준으로 관람 기록을 찾는다.
    @EntityGraph(attributePaths = {"visitor", "exhibit"})
    List<ViewHistory> findByExhibitId(Long exhibitId);
}


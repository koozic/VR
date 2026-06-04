package com.example.aiexhibition.history;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ViewHistoryRepository extends JpaRepository<ViewHistory, Long> {

    @EntityGraph(attributePaths = {"visitor", "exhibit"})
    List<ViewHistory> findAll();

    @EntityGraph(attributePaths = {"visitor", "exhibit"})
    Optional<ViewHistory> findById(Long id);

    @EntityGraph(attributePaths = {"visitor", "exhibit"})
    List<ViewHistory> findByVisitorId(Long visitorId);

    @EntityGraph(attributePaths = {"visitor", "exhibit"})
    List<ViewHistory> findByExhibitId(Long exhibitId);
}


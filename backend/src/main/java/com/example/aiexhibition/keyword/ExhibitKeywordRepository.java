package com.example.aiexhibition.keyword;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExhibitKeywordRepository extends JpaRepository<ExhibitKeyword, Long> {

    List<ExhibitKeyword> findByExhibitId(Long exhibitId);
}


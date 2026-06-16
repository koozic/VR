package com.example.aiexhibition.keyword;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExhibitKeywordRepository extends JpaRepository<ExhibitKeyword, Long> {

    List<ExhibitKeyword> findByExhibitId(Long exhibitId);

    @Query("select keyword from ExhibitKeyword keyword where keyword.exhibit.id in :exhibitIds order by keyword.id")
    List<ExhibitKeyword> findByExhibitIdIn(@Param("exhibitIds") List<Long> exhibitIds);

    void deleteByExhibitId(Long exhibitId);
}


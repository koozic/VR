package com.example.aiexhibition.keyword;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

// 작품 키워드 테이블을 조회하는 Repository다.
public interface ExhibitKeywordRepository extends JpaRepository<ExhibitKeyword, Long> {

    // 작품 하나의 키워드를 조회한다.
    List<ExhibitKeyword> findByExhibitId(Long exhibitId);

    // 작품 여러 개의 키워드를 한 번에 조회해 목록 API의 반복 쿼리를 줄인다.
    @Query("select keyword from ExhibitKeyword keyword where keyword.exhibit.id in :exhibitIds order by keyword.id")
    List<ExhibitKeyword> findByExhibitIdIn(@Param("exhibitIds") List<Long> exhibitIds);

    // 작품 삭제/seed 재적용 시 해당 작품의 키워드를 정리할 때 사용한다.
    void deleteByExhibitId(Long exhibitId);
}


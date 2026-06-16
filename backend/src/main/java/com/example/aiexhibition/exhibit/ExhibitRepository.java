package com.example.aiexhibition.exhibit;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

// 작품 엔티티를 DB에서 조회하는 Repository다.
public interface ExhibitRepository extends JpaRepository<Exhibit, Long> {

    // hall과 position은 LAZY 관계이므로 응답 변환 전에 fetch join으로 함께 읽는다.
    @Query("select e from Exhibit e left join fetch e.hall left join fetch e.position where e.hall.id = :hallId")
    List<Exhibit> findByHallId(@Param("hallId") Long hallId);

    // 전체 작품 목록 조회에서도 위치와 전시관 정보를 함께 읽어 DTO 변환 중 추가 쿼리를 줄인다.
    @Query("select e from Exhibit e left join fetch e.hall left join fetch e.position")
    List<Exhibit> findAllWithPosition();

    // 작품 상세 조회용 fetch join 쿼리다.
    @Query("select e from Exhibit e left join fetch e.hall left join fetch e.position where e.id = :id")
    Optional<Exhibit> findByIdWithPosition(@Param("id") Long id);

    // 제곱근을 생략한 3차원 거리 제곱으로 정렬해도 가까운 순서는 동일하다.
    // portal은 이동 장치이므로 AI 도슨트가 설명할 최근접 작품 후보에서 제외한다.
    @Query("""
            select e
            from Exhibit e
            join e.position p
            where (:hallId is null or e.hall.id = :hallId)
                and (e.type is null or e.type <> 'portal')
            order by ((p.posX - :x) * (p.posX - :x)
                + (p.posY - :y) * (p.posY - :y)
                + (p.posZ - :z) * (p.posZ - :z)) asc
            """)
    List<Exhibit> findNearest(
            @Param("x") Double x,
            @Param("y") Double y,
            @Param("z") Double z,
            @Param("hallId") Long hallId,
            Pageable pageable
    );
}


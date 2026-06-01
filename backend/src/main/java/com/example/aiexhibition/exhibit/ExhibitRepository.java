package com.example.aiexhibition.exhibit;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ExhibitRepository extends JpaRepository<Exhibit, Long> {

    @Query("select e from Exhibit e left join fetch e.hall left join fetch e.position")
    List<Exhibit> findAllWithPosition();

    @Query("select e from Exhibit e left join fetch e.hall left join fetch e.position where e.id = :id")
    Optional<Exhibit> findByIdWithPosition(@Param("id") Long id);

    @Query("""
            select e
            from Exhibit e
            join e.position p
            where (:hallId is null or e.hall.id = :hallId)
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


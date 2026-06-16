package com.example.aiexhibition.exhibit;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

// 작품 좌표 테이블을 조회하는 Repository다.
public interface ExhibitPositionRepository extends JpaRepository<ExhibitPosition, Long> {

    // 작품 하나는 좌표 하나를 가지므로 exhibitId로 기존 좌표가 있는지 찾는다.
    Optional<ExhibitPosition> findByExhibitId(Long exhibitId);
}

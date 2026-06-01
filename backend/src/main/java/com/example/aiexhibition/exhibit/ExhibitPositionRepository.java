package com.example.aiexhibition.exhibit;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExhibitPositionRepository extends JpaRepository<ExhibitPosition, Long> {

    Optional<ExhibitPosition> findByExhibitId(Long exhibitId);
}

package com.example.aiexhibition.exhibit;

import com.example.aiexhibition.exhibit.dto.ExhibitResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ExhibitService {

    private final ExhibitRepository exhibitRepository;

    public ExhibitService(ExhibitRepository exhibitRepository) {
        this.exhibitRepository = exhibitRepository;
    }

    public List<ExhibitResponse> findAll() {
        return exhibitRepository.findAllWithPosition().stream()
                .map(ExhibitResponse::from)
                .toList();
    }

    public ExhibitResponse findById(Long id) {
        return exhibitRepository.findByIdWithPosition(id)
                .map(ExhibitResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("Exhibit not found: " + id));
    }

    public ExhibitResponse findNearest(Double x, Double y, Double z, Long hallId, Double maxDistance) {
        Exhibit exhibit = exhibitRepository.findNearest(x, y, z, hallId, PageRequest.of(0, 1)).stream()
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Exhibit not found near visitor position."));

        if (maxDistance != null && exhibit.getPosition() != null) {
            double distance = distance(
                    x,
                    y,
                    z,
                    exhibit.getPosition().getPosX(),
                    exhibit.getPosition().getPosY(),
                    exhibit.getPosition().getPosZ()
            );
            if (distance > maxDistance) {
                throw new IllegalArgumentException("Exhibit not found within max distance: " + maxDistance);
            }
        }

        return ExhibitResponse.from(exhibit);
    }

    private double distance(Double x1, Double y1, Double z1, Double x2, Double y2, Double z2) {
        double dx = x1 - x2;
        double dy = y1 - y2;
        double dz = z1 - z2;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
}


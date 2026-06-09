package com.example.aiexhibition.exhibit;

import com.example.aiexhibition.exhibit.dto.ExhibitCreateRequest;
import com.example.aiexhibition.exhibit.dto.ExhibitPositionUpdateRequest;
import com.example.aiexhibition.exhibit.dto.ExhibitResponse;
import com.example.aiexhibition.exhibit.dto.ExhibitUpdateRequest;
import com.example.aiexhibition.hall.Hall;
import com.example.aiexhibition.hall.HallRepository;
import com.example.aiexhibition.keyword.ExhibitKeywordService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ExhibitService {

    private final ExhibitRepository exhibitRepository;
    private final ExhibitPositionRepository exhibitPositionRepository;
    private final HallRepository hallRepository;
    private final ExhibitKeywordService exhibitKeywordService;

    public ExhibitService(
            ExhibitRepository exhibitRepository,
            ExhibitPositionRepository exhibitPositionRepository,
            HallRepository hallRepository,
            ExhibitKeywordService exhibitKeywordService
    ) {
        this.exhibitRepository = exhibitRepository;
        this.exhibitPositionRepository = exhibitPositionRepository;
        this.hallRepository = hallRepository;
        this.exhibitKeywordService = exhibitKeywordService;
    }

    public List<ExhibitResponse> findAll() {
        return exhibitRepository.findAllWithPosition().stream()
                .map(this::toResponse)
                .toList();
    }

    public ExhibitResponse findById(Long id) {
        return exhibitRepository.findByIdWithPosition(id)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Exhibit not found: " + id));
    }

    @Transactional
    public ExhibitResponse create(ExhibitCreateRequest request) {
        Hall hall = hallRepository.findById(request.hallId())
                .orElseThrow(() -> new IllegalArgumentException("Hall not found: " + request.hallId()));

        Exhibit exhibit = exhibitRepository.save(new Exhibit(
                request.title(),
                request.creator(),
                request.description(),
                request.exampleText(),
                request.type(),
                request.contentUrl(),
                request.wallIndex(),
                request.rotationY(),
                request.scale(),
                request.wide(),
                request.thumbnailUrl(),
                request.portalTargetX(),
                request.portalTargetZ(),
                request.portalTargetYaw(),
                hall
        ));

        ExhibitPosition position = exhibitPositionRepository.save(new ExhibitPosition(
                exhibit,
                request.positionX(),
                request.positionY(),
                request.positionZ()
        ));
        exhibit.assignPosition(position);

        return toResponse(exhibit);
    }

    @Transactional
    public ExhibitResponse update(Long id, ExhibitUpdateRequest request) {
        Exhibit exhibit = findExhibitWithPosition(id);
        Hall hall = hallRepository.findById(request.hallId())
                .orElseThrow(() -> new IllegalArgumentException("Hall not found: " + request.hallId()));

        exhibit.update(
                request.title(),
                request.creator(),
                request.description(),
                request.exampleText(),
                request.type(),
                request.contentUrl(),
                request.wallIndex(),
                request.rotationY(),
                request.scale(),
                request.wide(),
                request.thumbnailUrl(),
                request.portalTargetX(),
                request.portalTargetZ(),
                request.portalTargetYaw(),
                hall
        );
        upsertPosition(exhibit, request.positionX(), request.positionY(), request.positionZ());

        return toResponse(exhibit);
    }

    @Transactional
    public ExhibitResponse updatePosition(Long id, ExhibitPositionUpdateRequest request) {
        Exhibit exhibit = findExhibitWithPosition(id);
        upsertPosition(exhibit, request.positionX(), request.positionY(), request.positionZ());

        return toResponse(exhibit);
    }

    @Transactional
    public void delete(Long id) {
        if (!exhibitRepository.existsById(id)) {
            throw new IllegalArgumentException("Exhibit not found: " + id);
        }
        exhibitRepository.deleteById(id);
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

        return toResponse(exhibit);
    }

    private Exhibit findExhibitWithPosition(Long id) {
        return exhibitRepository.findByIdWithPosition(id)
                .orElseThrow(() -> new IllegalArgumentException("Exhibit not found: " + id));
    }

    private ExhibitResponse toResponse(Exhibit exhibit) {
        return ExhibitResponse.from(
                exhibit,
                exhibitKeywordService.findKeywordsByExhibitId(exhibit.getId())
        );
    }

    private ExhibitPosition upsertPosition(Exhibit exhibit, Double posX, Double posY, Double posZ) {
        ExhibitPosition position = exhibitPositionRepository.findByExhibitId(exhibit.getId())
                .orElseGet(() -> {
                    ExhibitPosition newPosition = new ExhibitPosition(exhibit, posX, posY, posZ);
                    exhibit.assignPosition(newPosition);
                    return newPosition;
                });

        position.update(posX, posY, posZ);
        ExhibitPosition savedPosition = exhibitPositionRepository.save(position);
        exhibit.assignPosition(savedPosition);
        return savedPosition;
    }

    private double distance(Double x1, Double y1, Double z1, Double x2, Double y2, Double z2) {
        double dx = x1 - x2;
        double dy = y1 - y2;
        double dz = z1 - z2;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
}


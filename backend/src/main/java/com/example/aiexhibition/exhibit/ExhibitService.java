package com.example.aiexhibition.exhibit;

import com.example.aiexhibition.exhibit.dto.ExhibitCreateRequest;
import com.example.aiexhibition.exhibit.dto.ExhibitPositionUpdateRequest;
import com.example.aiexhibition.exhibit.dto.ExhibitResponse;
import com.example.aiexhibition.exhibit.dto.ExhibitUpdateRequest;
import com.example.aiexhibition.hall.Hall;
import com.example.aiexhibition.hall.HallRepository;
import com.example.aiexhibition.keyword.ExhibitKeywordService;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ExhibitService {

    // 작품 본문, 작품 위치, 전시관, 키워드를 조합해 작품 응답을 만든다.
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
        // 목록 조회는 위치 정보를 함께 가져오고, 키워드는 묶음 조회로 붙인다.
        return toResponses(exhibitRepository.findAllWithPosition());
    }

    public ExhibitResponse findById(Long id) {
        // 상세 조회는 위치 정보까지 fetch join한 Repository 메서드를 사용한다.
        return exhibitRepository.findByIdWithPosition(id)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Exhibit not found: " + id));
    }

    @Transactional
    public ExhibitResponse create(ExhibitCreateRequest request) {
        // 작품은 반드시 전시관에 속해야 하므로 hallId로 전시관을 먼저 검증한다.
        Hall hall = hallRepository.findById(request.hallId())
                .orElseThrow(() -> new IllegalArgumentException("Hall not found: " + request.hallId()));

        // 작품의 설명/표시 설정을 Exhibit 테이블에 먼저 저장한다.
        Exhibit exhibit = exhibitRepository.save(new Exhibit(
                request.title(),
                request.creator(),
                request.description(),
                request.exampleText(),
                request.docentContext(),
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

        // 3D 좌표는 별도 테이블에 저장하고, 응답 변환을 위해 엔티티에도 연결한다.
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
        // JPA가 관리 중인 엔티티 값을 바꾸면 트랜잭션 종료 시 UPDATE SQL이 실행된다.
        Exhibit exhibit = findExhibitWithPosition(id);
        Hall hall = hallRepository.findById(request.hallId())
                .orElseThrow(() -> new IllegalArgumentException("Hall not found: " + request.hallId()));

        exhibit.update(
                request.title(),
                request.creator(),
                request.description(),
                request.exampleText(),
                request.docentContext(),
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
        // 작품 본문은 유지하고 좌표 행만 생성 또는 수정한다.
        Exhibit exhibit = findExhibitWithPosition(id);
        upsertPosition(exhibit, request.positionX(), request.positionY(), request.positionZ());

        return toResponse(exhibit);
    }

    @Transactional
    public void delete(Long id) {
        // 없는 ID를 삭제 요청하면 조용히 성공시키지 않고 잘못된 요청으로 알려준다.
        if (!exhibitRepository.existsById(id)) {
            throw new IllegalArgumentException("Exhibit not found: " + id);
        }
        exhibitRepository.deleteById(id);
    }

    public ExhibitResponse findNearest(Double x, Double y, Double z, Long hallId, Double maxDistance) {
        // DB에서 거리순으로 정렬한 뒤 가장 가까운 작품 하나만 가져온다.
        Exhibit exhibit = exhibitRepository.findNearest(x, y, z, hallId, PageRequest.of(0, 1)).stream()
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Exhibit not found near visitor position."));

        if (maxDistance != null && exhibit.getPosition() != null) {
            // 사용자가 허용한 최대 거리보다 멀면 가까운 작품이 없는 것으로 처리한다.
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

    private List<ExhibitResponse> toResponses(List<Exhibit> exhibits) {
        // 목록 응답에서 N번 키워드 조회가 발생하지 않도록 작품 ID를 모아 한 번에 조회한다.
        Map<Long, List<String>> keywordsByExhibitId = exhibitKeywordService.findKeywordsByExhibitIds(
                exhibits.stream()
                        .map(Exhibit::getId)
                        .toList()
        );

        return exhibits.stream()
                .map(exhibit -> toResponse(exhibit, keywordsByExhibitId))
                .toList();
    }

    private ExhibitResponse toResponse(Exhibit exhibit, Map<Long, List<String>> keywordsByExhibitId) {
        return ExhibitResponse.from(
                exhibit,
                keywordsByExhibitId.getOrDefault(exhibit.getId(), List.of())
        );
    }

    private ExhibitPosition upsertPosition(Exhibit exhibit, Double posX, Double posY, Double posZ) {
        // 좌표가 이미 있으면 수정하고, 없으면 새 좌표 엔티티를 만드는 upsert 흐름이다.
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

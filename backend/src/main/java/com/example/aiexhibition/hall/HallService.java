package com.example.aiexhibition.hall;

import com.example.aiexhibition.exhibit.Exhibit;
import com.example.aiexhibition.exhibit.ExhibitRepository;
import com.example.aiexhibition.exhibit.dto.ExhibitResponse;
import com.example.aiexhibition.hall.dto.HallResponse;
import com.example.aiexhibition.keyword.ExhibitKeywordService;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class HallService {

    // 전시관, 작품, 키워드를 각각 조회해 전시관 응답 DTO로 조립한다.
    private final HallRepository hallRepository;
    private final ExhibitRepository exhibitRepository;
    private final ExhibitKeywordService exhibitKeywordService;

    public HallService(
            HallRepository hallRepository,
            ExhibitRepository exhibitRepository,
            ExhibitKeywordService exhibitKeywordService
    ) {
        this.hallRepository = hallRepository;
        this.exhibitRepository = exhibitRepository;
        this.exhibitKeywordService = exhibitKeywordService;
    }

    public List<HallResponse> findAll() {
        // 각 전시관마다 소속 작품까지 붙여서 전시관 목록 응답을 만든다.
        return hallRepository.findAll().stream()
                .map(hall -> HallResponse.from(hall, findExhibitResponsesByHallId(hall.getId())))
                .toList();
    }

    public HallResponse findById(Long id) {
        // 존재하지 않는 전시관 ID는 잘못된 요청으로 처리한다.
        Hall hall = hallRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Hall not found: " + id));
        return HallResponse.from(hall, findExhibitResponsesByHallId(id));
    }

    public List<ExhibitResponse> findExhibitsByHallId(Long hallId) {
        // 작품 목록을 조회하기 전에 전시관 자체가 있는지 먼저 검증한다.
        ensureHallExists(hallId);
        return findExhibitResponsesByHallId(hallId);
    }

    private void ensureHallExists(Long hallId) {
        if (!hallRepository.existsById(hallId)) {
            throw new IllegalArgumentException("Hall not found: " + hallId);
        }
    }

    private List<ExhibitResponse> findExhibitResponsesByHallId(Long hallId) {
        // 전시관 ID로 작품들을 찾은 뒤, 작품별 키워드를 묶음 조회해 붙인다.
        List<Exhibit> exhibits = exhibitRepository.findByHallId(hallId);
        return toResponses(exhibits);
    }

    private List<ExhibitResponse> toResponses(List<Exhibit> exhibits) {
        // 작품마다 키워드를 한 번씩 조회하지 않고, 작품 ID 목록으로 한 번에 조회한다.
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
}

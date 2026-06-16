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
        return hallRepository.findAll().stream()
                .map(hall -> HallResponse.from(hall, findExhibitResponsesByHallId(hall.getId())))
                .toList();
    }

    public HallResponse findById(Long id) {
        Hall hall = hallRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Hall not found: " + id));
        return HallResponse.from(hall, findExhibitResponsesByHallId(id));
    }

    public List<ExhibitResponse> findExhibitsByHallId(Long hallId) {
        ensureHallExists(hallId);
        return findExhibitResponsesByHallId(hallId);
    }

    private void ensureHallExists(Long hallId) {
        if (!hallRepository.existsById(hallId)) {
            throw new IllegalArgumentException("Hall not found: " + hallId);
        }
    }

    private List<ExhibitResponse> findExhibitResponsesByHallId(Long hallId) {
        List<Exhibit> exhibits = exhibitRepository.findByHallId(hallId);
        return toResponses(exhibits);
    }

    private List<ExhibitResponse> toResponses(List<Exhibit> exhibits) {
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

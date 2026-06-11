package com.example.aiexhibition.hall;

import com.example.aiexhibition.exhibit.ExhibitRepository;
import com.example.aiexhibition.exhibit.dto.ExhibitResponse;
import com.example.aiexhibition.hall.dto.HallResponse;
import com.example.aiexhibition.keyword.ExhibitKeywordService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
        // 각 전시관 정보와 그 안의 작품 목록을 묶어 프런트엔드에 반환한다.
        return hallRepository.findAll().stream()
                .map(hall -> {
                    List<ExhibitResponse> exhibits = exhibitRepository.findByHallId(hall.getId()).stream()
                            .map(this::toResponse)
                            .toList();
                    return HallResponse.from(hall, exhibits);
                })
                .toList();
    }

    public HallResponse findById(Long id) {
        // 전시관 상세 화면에 필요한 작품과 작품별 키워드까지 함께 조립한다.
        Hall hall = hallRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Hall not found: " + id));
        List<ExhibitResponse> exhibits = exhibitRepository.findByHallId(id).stream()
                .map(this::toResponse)
                .toList();
        return HallResponse.from(hall, exhibits);
    }

    private ExhibitResponse toResponse(com.example.aiexhibition.exhibit.Exhibit exhibit) {
        // LAZY 엔티티를 직접 JSON으로 반환하지 않고 필요한 필드만 DTO에 담는다.
        return ExhibitResponse.from(
                exhibit,
                exhibitKeywordService.findKeywordsByExhibitId(exhibit.getId())
        );
    }
}


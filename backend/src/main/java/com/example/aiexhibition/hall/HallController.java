package com.example.aiexhibition.hall;

import com.example.aiexhibition.exhibit.dto.ExhibitResponse;
import com.example.aiexhibition.hall.dto.HallResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/halls", "/api/rooms"})
public class HallController {

    // 전시관 API의 실제 조회 로직은 HallService가 담당한다.
    private final HallService hallService;

    public HallController(HallService hallService) {
        this.hallService = hallService;
    }

    @GetMapping
    public List<HallResponse> findAll() {
        // 모든 전시관과 각 전시관의 작품 목록을 함께 조회한다.
        return hallService.findAll();
    }

    @GetMapping("/{id}")
    public HallResponse findById(@PathVariable Long id) {
        // 전시관 ID로 상세 정보를 조회한다.
        return hallService.findById(id);
    }

    @GetMapping("/{roomId}/exhibits")
    public List<ExhibitResponse> findExhibitsByHall(@PathVariable Long roomId) {
        // 특정 전시관에 속한 작품 목록만 필요한 화면에서 사용한다.
        return hallService.findExhibitsByHallId(roomId);
    }
}

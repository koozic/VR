package com.example.aiexhibition.hall;

import com.example.aiexhibition.exhibit.dto.ExhibitResponse;
import com.example.aiexhibition.hall.dto.HallResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/halls", "/api/rooms"})
public class HallController {

    // 전시관 기본 정보와 해당 전시관의 작품 목록을 조회하는 REST 진입점이다.
    private final HallService hallService;

    public HallController(HallService hallService) {
        this.hallService = hallService;
    }

    @GetMapping
    public List<HallResponse> findAll() {
        return hallService.findAll();
    }

    @GetMapping("/{id}")
    public HallResponse findById(@PathVariable Long id) {
        return hallService.findById(id);
    }

    @GetMapping("/{roomId}/exhibits")
    public List<ExhibitResponse> findExhibitsByHall(@PathVariable Long roomId) {
        // 별도 중복 조회 로직 없이 Hall 상세 응답에 포함된 작품 목록을 재사용한다.
        return hallService.findById(roomId).exhibits();
    }
}


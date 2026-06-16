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
        return hallService.findExhibitsByHallId(roomId);
    }
}

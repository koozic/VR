package com.example.aiexhibition.hall;

import com.example.aiexhibition.hall.dto.HallResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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
}


package com.example.aiexhibition.exhibit;

import com.example.aiexhibition.exhibit.dto.ExhibitCreateRequest;
import com.example.aiexhibition.exhibit.dto.ExhibitResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/exhibits", "/api/artworks"})
public class ExhibitController {

    private final ExhibitService exhibitService;

    public ExhibitController(ExhibitService exhibitService) {
        this.exhibitService = exhibitService;
    }

    @GetMapping
    public List<ExhibitResponse> findAll() {
        return exhibitService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExhibitResponse create(@Valid @RequestBody ExhibitCreateRequest request) {
        return exhibitService.create(request);
    }

    @GetMapping("/nearest")
    public ExhibitResponse findNearest(
            @RequestParam Double x,
            @RequestParam Double y,
            @RequestParam Double z,
            @RequestParam(required = false) Long hallId,
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false) Double maxDistance
    ) {
        Long effectiveHallId = hallId != null ? hallId : roomId;
        return exhibitService.findNearest(x, y, z, effectiveHallId, maxDistance);
    }

    @GetMapping("/{id}")
    public ExhibitResponse findById(@PathVariable Long id) {
        return exhibitService.findById(id);
    }
}


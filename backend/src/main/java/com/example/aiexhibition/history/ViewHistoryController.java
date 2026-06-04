package com.example.aiexhibition.history;

import com.example.aiexhibition.history.dto.ViewHistoryCreateRequest;
import com.example.aiexhibition.history.dto.ViewHistoryResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/view-histories")
public class ViewHistoryController {

    private final ViewHistoryService viewHistoryService;

    public ViewHistoryController(ViewHistoryService viewHistoryService) {
        this.viewHistoryService = viewHistoryService;
    }

    @GetMapping
    public List<ViewHistoryResponse> findAll() {
        return viewHistoryService.findAll();
    }

    @GetMapping("/{id}")
    public ViewHistoryResponse findById(@PathVariable Long id) {
        return viewHistoryService.findById(id);
    }

    @GetMapping("/visitors/{visitorId}")
    public List<ViewHistoryResponse> findByVisitorId(@PathVariable Long visitorId) {
        return viewHistoryService.findByVisitorId(visitorId);
    }

    @GetMapping("/exhibits/{exhibitId}")
    public List<ViewHistoryResponse> findByExhibitId(@PathVariable Long exhibitId) {
        return viewHistoryService.findByExhibitId(exhibitId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ViewHistoryResponse create(@Valid @RequestBody ViewHistoryCreateRequest request) {
        return viewHistoryService.create(request);
    }
}

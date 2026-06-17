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

    // 관람 기록 API 요청을 실제 업무 로직을 가진 Service로 전달한다.
    private final ViewHistoryService viewHistoryService;

    public ViewHistoryController(ViewHistoryService viewHistoryService) {
        this.viewHistoryService = viewHistoryService;
    }

    @GetMapping
    public List<ViewHistoryResponse> findAll() {
        // GET /api/view-histories: 전체 관람 기록을 조회한다.
        return viewHistoryService.findAll();
    }

    @GetMapping("/{id}")
    public ViewHistoryResponse findById(@PathVariable Long id) {
        // 관람 기록 자체의 ID로 단건 조회한다.
        return viewHistoryService.findById(id);
    }

    @GetMapping("/visitors/{visitorId}")
    public List<ViewHistoryResponse> findByVisitorId(@PathVariable Long visitorId) {
        // 특정 방문자가 어떤 작품을 봤는지 조회한다.
        return viewHistoryService.findByVisitorId(visitorId);
    }

    @GetMapping("/exhibits/{exhibitId}")
    public List<ViewHistoryResponse> findByExhibitId(@PathVariable Long exhibitId) {
        // 특정 작품이 어떤 방문 기록을 가지고 있는지 조회한다.
        return viewHistoryService.findByExhibitId(exhibitId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ViewHistoryResponse create(@Valid @RequestBody ViewHistoryCreateRequest request) {
        // 방문자 ID와 작품 ID를 받아 새 관람 기록을 저장한다.
        return viewHistoryService.create(request);
    }
}

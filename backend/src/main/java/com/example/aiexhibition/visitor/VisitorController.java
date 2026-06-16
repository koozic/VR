package com.example.aiexhibition.visitor;

import com.example.aiexhibition.visitor.dto.VisitorCreateRequest;
import com.example.aiexhibition.visitor.dto.VisitorResponse;
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
@RequestMapping("/api/visitors")
public class VisitorController {

    // 방문자 API의 실제 조회/생성 로직은 Service가 담당하고, Controller는 HTTP 입출력만 맡는다.
    private final VisitorService visitorService;

    public VisitorController(VisitorService visitorService) {
        this.visitorService = visitorService;
    }

    @GetMapping
    public List<VisitorResponse> findAll() {
        // GET /api/visitors: 저장된 모든 방문자 목록을 응답한다.
        return visitorService.findAll();
    }

    @GetMapping("/{id}")
    public VisitorResponse findById(@PathVariable Long id) {
        // URL 경로의 id 값으로 방문자 한 명을 조회한다.
        return visitorService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VisitorResponse create(@Valid @RequestBody VisitorCreateRequest request) {
        // JSON 요청 본문을 DTO로 받고, @Valid로 닉네임/이메일 조건을 먼저 검사한다.
        return visitorService.create(request);
    }
}


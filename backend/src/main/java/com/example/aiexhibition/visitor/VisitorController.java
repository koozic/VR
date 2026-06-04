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

    private final VisitorService visitorService;

    public VisitorController(VisitorService visitorService) {
        this.visitorService = visitorService;
    }

    @GetMapping
    public List<VisitorResponse> findAll() {
        return visitorService.findAll();
    }

    @GetMapping("/{id}")
    public VisitorResponse findById(@PathVariable Long id) {
        return visitorService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VisitorResponse create(@Valid @RequestBody VisitorCreateRequest request) {
        return visitorService.create(request);
    }
}


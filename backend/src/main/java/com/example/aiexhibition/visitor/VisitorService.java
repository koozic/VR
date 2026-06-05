package com.example.aiexhibition.visitor;

import com.example.aiexhibition.visitor.dto.VisitorCreateRequest;
import com.example.aiexhibition.visitor.dto.VisitorResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class VisitorService {

    private final VisitorRepository visitorRepository;

    public VisitorService(VisitorRepository visitorRepository) {
        this.visitorRepository = visitorRepository;
    }

    public List<VisitorResponse> findAll() {
        return visitorRepository.findAll().stream()
                .map(VisitorResponse::from)
                .toList();
    }

    public VisitorResponse findById(Long id) {
        return visitorRepository.findById(id)
                .map(VisitorResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("Visitor not found: " + id));
    }

    @Transactional
    public VisitorResponse create(VisitorCreateRequest request) {
        Visitor visitor = visitorRepository.save(new Visitor(
                request.nickname(),
                request.email()
        ));

        return VisitorResponse.from(visitor);
    }
}


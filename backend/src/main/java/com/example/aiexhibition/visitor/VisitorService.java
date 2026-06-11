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
        // DTO에서 검증된 값으로 엔티티를 만들고 저장 결과를 다시 응답 DTO로 변환한다.
        Visitor visitor = visitorRepository.save(new Visitor(
                request.nickname(),
                request.email()
        ));

        return VisitorResponse.from(visitor);
    }
}


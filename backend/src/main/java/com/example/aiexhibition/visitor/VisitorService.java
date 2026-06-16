package com.example.aiexhibition.visitor;

import com.example.aiexhibition.visitor.dto.VisitorCreateRequest;
import com.example.aiexhibition.visitor.dto.VisitorResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class VisitorService {

    // Repository는 Visitor 테이블에 직접 접근하는 Spring Data JPA 객체다.
    private final VisitorRepository visitorRepository;

    public VisitorService(VisitorRepository visitorRepository) {
        this.visitorRepository = visitorRepository;
    }

    public List<VisitorResponse> findAll() {
        // 엔티티를 그대로 노출하지 않고 프런트엔드 응답용 DTO로 바꿔서 반환한다.
        return visitorRepository.findAll().stream()
                .map(VisitorResponse::from)
                .toList();
    }

    public VisitorResponse findById(Long id) {
        // Optional이 비어 있으면 존재하지 않는 방문자로 보고 400 응답으로 변환될 예외를 던진다.
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


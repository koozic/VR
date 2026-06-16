package com.example.aiexhibition.history;

import com.example.aiexhibition.exhibit.Exhibit;
import com.example.aiexhibition.exhibit.ExhibitRepository;
import com.example.aiexhibition.history.dto.ViewHistoryCreateRequest;
import com.example.aiexhibition.history.dto.ViewHistoryResponse;
import com.example.aiexhibition.visitor.Visitor;
import com.example.aiexhibition.visitor.VisitorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ViewHistoryService {

    // 관람 기록 저장/조회와, 기록에 연결될 방문자/작품 존재 검증을 위해 세 Repository를 함께 사용한다.
    private final ViewHistoryRepository viewHistoryRepository;
    private final VisitorRepository visitorRepository;
    private final ExhibitRepository exhibitRepository;

    public ViewHistoryService(
            ViewHistoryRepository viewHistoryRepository,
            VisitorRepository visitorRepository,
            ExhibitRepository exhibitRepository
    ) {
        this.viewHistoryRepository = viewHistoryRepository;
        this.visitorRepository = visitorRepository;
        this.exhibitRepository = exhibitRepository;
    }

    public List<ViewHistoryResponse> findAll() {
        // 전체 관람 기록을 조회하고 응답 DTO로 변환한다.
        return viewHistoryRepository.findAll().stream()
                .map(ViewHistoryResponse::from)
                .toList();
    }

    public ViewHistoryResponse findById(Long id) {
        // 기록 ID가 없으면 잘못된 요청으로 처리한다.
        return viewHistoryRepository.findById(id)
                .map(ViewHistoryResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("View history not found: " + id));
    }

    public List<ViewHistoryResponse> findByVisitorId(Long visitorId) {
        // 방문자 기준으로 관람 기록 목록을 필터링한다.
        return viewHistoryRepository.findByVisitorId(visitorId).stream()
                .map(ViewHistoryResponse::from)
                .toList();
    }

    public List<ViewHistoryResponse> findByExhibitId(Long exhibitId) {
        // 작품 기준으로 관람 기록 목록을 필터링한다.
        return viewHistoryRepository.findByExhibitId(exhibitId).stream()
                .map(ViewHistoryResponse::from)
                .toList();
    }

    @Transactional
    public ViewHistoryResponse create(ViewHistoryCreateRequest request) {
        // 잘못된 외래 키로 관람 기록이 저장되지 않도록 방문자와 작품의 존재를 먼저 확인한다.
        Visitor visitor = visitorRepository.findById(request.visitorId())
                .orElseThrow(() -> new IllegalArgumentException("Visitor not found: " + request.visitorId()));
        Exhibit exhibit = exhibitRepository.findById(request.exhibitId())
                .orElseThrow(() -> new IllegalArgumentException("Exhibit not found: " + request.exhibitId()));

        // 관람 시각은 클라이언트 값이 아니라 서버가 기록하는 현재 시각을 사용한다.
        ViewHistory viewHistory = viewHistoryRepository.save(new ViewHistory(
                visitor,
                exhibit,
                LocalDateTime.now(),
                request.durationSeconds()
        ));

        return ViewHistoryResponse.from(viewHistory);
    }
}


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
        return viewHistoryRepository.findAll().stream()
                .map(ViewHistoryResponse::from)
                .toList();
    }

    public ViewHistoryResponse findById(Long id) {
        return viewHistoryRepository.findById(id)
                .map(ViewHistoryResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("View history not found: " + id));
    }

    public List<ViewHistoryResponse> findByVisitorId(Long visitorId) {
        return viewHistoryRepository.findByVisitorId(visitorId).stream()
                .map(ViewHistoryResponse::from)
                .toList();
    }

    public List<ViewHistoryResponse> findByExhibitId(Long exhibitId) {
        return viewHistoryRepository.findByExhibitId(exhibitId).stream()
                .map(ViewHistoryResponse::from)
                .toList();
    }

    @Transactional
    public ViewHistoryResponse create(ViewHistoryCreateRequest request) {
        Visitor visitor = visitorRepository.findById(request.visitorId())
                .orElseThrow(() -> new IllegalArgumentException("Visitor not found: " + request.visitorId()));
        Exhibit exhibit = exhibitRepository.findById(request.exhibitId())
                .orElseThrow(() -> new IllegalArgumentException("Exhibit not found: " + request.exhibitId()));

        ViewHistory viewHistory = viewHistoryRepository.save(new ViewHistory(
                visitor,
                exhibit,
                LocalDateTime.now(),
                request.durationSeconds()
        ));

        return ViewHistoryResponse.from(viewHistory);
    }
}


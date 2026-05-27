package com.example.aiexhibition.history;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ViewHistoryService {

    private final ViewHistoryRepository viewHistoryRepository;

    public ViewHistoryService(ViewHistoryRepository viewHistoryRepository) {
        this.viewHistoryRepository = viewHistoryRepository;
    }

    public List<ViewHistory> findAll() {
        return viewHistoryRepository.findAll();
    }
}


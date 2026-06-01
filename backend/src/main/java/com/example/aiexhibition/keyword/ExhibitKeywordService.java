package com.example.aiexhibition.keyword;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ExhibitKeywordService {

    private final ExhibitKeywordRepository exhibitKeywordRepository;

    public ExhibitKeywordService(ExhibitKeywordRepository exhibitKeywordRepository) {
        this.exhibitKeywordRepository = exhibitKeywordRepository;
    }

    public List<String> findKeywordsByExhibitId(Long exhibitId) {
        return exhibitKeywordRepository.findByExhibitId(exhibitId).stream()
                .map(ExhibitKeyword::getKeyword)
                .toList();
    }
}


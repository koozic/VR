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
        // 키워드 엔티티 전체가 아니라 AI 프롬프트와 API 응답에 필요한 문자열만 반환한다.
        return exhibitKeywordRepository.findByExhibitId(exhibitId).stream()
                .map(ExhibitKeyword::getKeyword)
                .toList();
    }
}


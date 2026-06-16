package com.example.aiexhibition.keyword;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ExhibitKeywordService {

    // 작품별 키워드를 조회하는 Repository다.
    private final ExhibitKeywordRepository exhibitKeywordRepository;

    public ExhibitKeywordService(ExhibitKeywordRepository exhibitKeywordRepository) {
        this.exhibitKeywordRepository = exhibitKeywordRepository;
    }

    public List<String> findKeywordsByExhibitId(Long exhibitId) {
        // AI 프롬프트와 응답 DTO에는 키워드 엔티티 전체가 아니라 문자열 목록만 필요하다.
        return exhibitKeywordRepository.findByExhibitId(exhibitId).stream()
                .map(ExhibitKeyword::getKeyword)
                .toList();
    }

    public Map<Long, List<String>> findKeywordsByExhibitIds(List<Long> exhibitIds) {
        // 작품 목록 화면에서 작품마다 따로 조회하지 않도록 여러 작품의 키워드를 한 번에 가져온다.
        if (exhibitIds == null || exhibitIds.isEmpty()) {
            return Map.of();
        }

        return exhibitKeywordRepository.findByExhibitIdIn(exhibitIds).stream()
                .collect(Collectors.groupingBy(
                        keyword -> keyword.getExhibit().getId(),
                        Collectors.mapping(ExhibitKeyword::getKeyword, Collectors.toList())
                ));
    }
}

package com.example.aiexhibition.keyword;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public Map<Long, List<String>> findKeywordsByExhibitIds(List<Long> exhibitIds) {
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

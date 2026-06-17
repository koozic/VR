package com.example.aiexhibition.history.dto;

import com.example.aiexhibition.exhibit.Exhibit;
import com.example.aiexhibition.history.ViewHistory;
import com.example.aiexhibition.visitor.Visitor;

import java.time.LocalDateTime;

// 관람 기록을 화면에 보여줄 때 필요한 방문자/작품 요약 정보를 담는 응답 DTO다.
public record ViewHistoryResponse(
        Long id,
        Long visitorId,
        String visitorNickname,
        Long exhibitId,
        String exhibitTitle,
        LocalDateTime viewedAt,
        Integer durationSeconds
) {
    public static ViewHistoryResponse from(ViewHistory viewHistory) {
        // 연관 엔티티가 없을 가능성까지 방어하면서 응답에 필요한 값만 꺼낸다.
        Visitor visitor = viewHistory.getVisitor();
        Exhibit exhibit = viewHistory.getExhibit();

        return new ViewHistoryResponse(
                viewHistory.getId(),
                visitor == null ? null : visitor.getId(),
                visitor == null ? null : visitor.getNickname(),
                exhibit == null ? null : exhibit.getId(),
                exhibit == null ? null : exhibit.getTitle(),
                viewHistory.getViewedAt(),
                viewHistory.getDurationSeconds()
        );
    }
}

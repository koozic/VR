package com.example.aiexhibition.history.dto;

import com.example.aiexhibition.exhibit.Exhibit;
import com.example.aiexhibition.history.ViewHistory;
import com.example.aiexhibition.visitor.Visitor;

import java.time.LocalDateTime;

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

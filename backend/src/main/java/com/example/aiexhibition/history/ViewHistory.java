package com.example.aiexhibition.history;

import com.example.aiexhibition.exhibit.Exhibit;
import com.example.aiexhibition.visitor.Visitor;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import java.time.LocalDateTime;

@Entity
public class ViewHistory {

    // 관람 기록 한 건을 구분하는 DB 기본 키다.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 사용자가 작품을 본 시각과 머문 시간을 저장한다.
    private LocalDateTime viewedAt;
    private Integer durationSeconds;

    // 어떤 방문자의 기록인지 연결한다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visitor_id")
    private Visitor visitor;

    // 어떤 작품을 본 기록인지 연결한다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EXHIBIT_ID")
    private Exhibit exhibit;

    protected ViewHistory() {
        // JPA가 DB 조회 결과를 객체로 만들 때 사용하는 기본 생성자다.
    }

    public ViewHistory(Visitor visitor, Exhibit exhibit, LocalDateTime viewedAt, Integer durationSeconds) {
        // 서비스 계층에서 새 관람 기록을 만들 때 사용하는 생성자다.
        this.visitor = visitor;
        this.exhibit = exhibit;
        this.viewedAt = viewedAt;
        this.durationSeconds = durationSeconds;
    }

    public Long getId() {
        return id;
    }

    public Visitor getVisitor() {
        return visitor;
    }

    public Exhibit getExhibit() {
        return exhibit;
    }

    public LocalDateTime getViewedAt() {
        return viewedAt;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }
}


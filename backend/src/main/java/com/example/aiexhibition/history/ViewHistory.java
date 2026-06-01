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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime viewedAt;
    private Integer durationSeconds;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visitor_id")
    private Visitor visitor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EXHIBIT_ID")
    private Exhibit exhibit;

    protected ViewHistory() {
    }

    public ViewHistory(Visitor visitor, Exhibit exhibit, LocalDateTime viewedAt, Integer durationSeconds) {
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


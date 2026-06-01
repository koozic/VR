package com.example.aiexhibition.keyword;

import com.example.aiexhibition.exhibit.Exhibit;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class ExhibitKeyword {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String keyword;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EXHIBIT_ID")
    private Exhibit exhibit;

    protected ExhibitKeyword() {
    }

    public ExhibitKeyword(String keyword, Exhibit exhibit) {
        this.keyword = keyword;
        this.exhibit = exhibit;
    }

    public Long getId() {
        return id;
    }

    public String getKeyword() {
        return keyword;
    }

    public Exhibit getExhibit() {
        return exhibit;
    }
}


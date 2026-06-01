package com.example.aiexhibition.exhibit;

import com.example.aiexhibition.hall.Hall;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "EXHIBITS")
public class Exhibit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "TITLE", nullable = false, length = 200)
    private String title;

    @Column(name = "CREATOR", length = 100)
    private String creator;

    @Lob
    @Column(name = "DESCRIPTION")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "HALL_ID", nullable = false)
    private Hall hall;

    @OneToOne(mappedBy = "exhibit", fetch = FetchType.LAZY)
    private ExhibitPosition position;

    protected Exhibit() {
    }

    public Exhibit(String title, String creator, String description, Hall hall) {
        this.title = title;
        this.description = description;
        this.creator = creator;
        this.hall = hall;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getCreator() {
        return creator;
    }

    public Hall getHall() {
        return hall;
    }

    public ExhibitPosition getPosition() {
        return position;
    }

    public void assignPosition(ExhibitPosition position) {
        this.position = position;
    }

    public void update(String title, String creator, String description, Hall hall) {
        this.title = title;
        this.creator = creator;
        this.description = description;
        this.hall = hall;
    }
}


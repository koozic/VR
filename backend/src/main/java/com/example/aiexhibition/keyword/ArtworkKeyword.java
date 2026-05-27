package com.example.aiexhibition.keyword;

import com.example.aiexhibition.artwork.Artwork;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class ArtworkKeyword {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String keyword;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artwork_id")
    private Artwork artwork;

    protected ArtworkKeyword() {
    }

    public ArtworkKeyword(String keyword, Artwork artwork) {
        this.keyword = keyword;
        this.artwork = artwork;
    }

    public Long getId() {
        return id;
    }

    public String getKeyword() {
        return keyword;
    }

    public Artwork getArtwork() {
        return artwork;
    }
}


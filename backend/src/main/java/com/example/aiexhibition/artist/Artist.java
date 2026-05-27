package com.example.aiexhibition.artist;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Artist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String biography;

    protected Artist() {
    }

    public Artist(String name, String biography) {
        this.name = name;
        this.biography = biography;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getBiography() {
        return biography;
    }
}


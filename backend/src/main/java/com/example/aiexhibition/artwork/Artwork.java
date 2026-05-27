package com.example.aiexhibition.artwork;

import com.example.aiexhibition.artist.Artist;
import com.example.aiexhibition.room.Room;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Artwork {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private Integer year;
    private String imageUrl;
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id")
    private Artist artist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    protected Artwork() {
    }

    public Artwork(String title, Integer year, String imageUrl, String description, Artist artist, Room room) {
        this.title = title;
        this.year = year;
        this.imageUrl = imageUrl;
        this.description = description;
        this.artist = artist;
        this.room = room;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public Integer getYear() {
        return year;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getDescription() {
        return description;
    }

    public Artist getArtist() {
        return artist;
    }

    public Room getRoom() {
        return room;
    }
}


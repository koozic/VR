package com.example.aiexhibition.artwork;

import com.example.aiexhibition.artist.Artist;
import com.example.aiexhibition.room.Room;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Artwork {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    @Column(name = "production_year")
    private Integer year;
    private String imageUrl;
    private String description;

    private String type;
    @Column(name = "content_url")
    private String contentUrl;
    @Column(name = "wall_index")
    private Integer wallIndex;
    private Double posX;
    private Double posY;
    private Double posZ;
    @Column(name = "rotation_y")
    private Double rotationY;
    private Double scale;
    private Boolean wide;
    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "portal_target_x")
    private Double portalTargetX;
    @Column(name = "portal_target_z")
    private Double portalTargetZ;
    @Column(name = "portal_target_yaw")
    private Double portalTargetYaw;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id")
    private Artist artist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    protected Artwork() {
    }

    public Artwork(String title, Integer year, String imageUrl, String description,
                   String type, String contentUrl, Integer wallIndex,
                   Double posX, Double posY, Double posZ, Double rotationY,
                   Double scale, Boolean wide, String thumbnailUrl,
                   Artist artist, Room room) {
        this.title = title;
        this.year = year;
        this.imageUrl = imageUrl;
        this.description = description;
        this.type = type;
        this.contentUrl = contentUrl;
        this.wallIndex = wallIndex;
        this.posX = posX;
        this.posY = posY;
        this.posZ = posZ;
        this.rotationY = rotationY;
        this.scale = scale;
        this.wide = wide;
        this.thumbnailUrl = thumbnailUrl;
        this.artist = artist;
        this.room = room;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public Integer getYear() { return year; }
    public String getImageUrl() { return imageUrl; }
    public String getDescription() { return description; }
    public String getType() { return type; }
    public String getContentUrl() { return contentUrl; }
    public Integer getWallIndex() { return wallIndex; }
    public Double getPosX() { return posX; }
    public Double getPosY() { return posY; }
    public Double getPosZ() { return posZ; }
    public Double getRotationY() { return rotationY; }
    public Double getScale() { return scale; }
    public Boolean getWide() { return wide; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public Double getPortalTargetX() { return portalTargetX; }
    public Double getPortalTargetZ() { return portalTargetZ; }
    public Double getPortalTargetYaw() { return portalTargetYaw; }
    public void setPortalTargetX(Double portalTargetX) { this.portalTargetX = portalTargetX; }
    public void setPortalTargetZ(Double portalTargetZ) { this.portalTargetZ = portalTargetZ; }
    public void setPortalTargetYaw(Double portalTargetYaw) { this.portalTargetYaw = portalTargetYaw; }
    public Artist getArtist() { return artist; }
    public Room getRoom() { return room; }
}

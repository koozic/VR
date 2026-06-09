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

    @Lob
    @Column(name = "EXAMPLE_TEXT")
    private String exampleText;

    private String type;

    @Column(name = "CONTENT_URL")
    private String contentUrl;

    @Column(name = "WALL_INDEX")
    private Integer wallIndex;

    @Column(name = "ROTATION_Y")
    private Double rotationY;

    private Double scale;

    private Boolean wide;

    @Column(name = "THUMBNAIL_URL")
    private String thumbnailUrl;

    @Column(name = "PORTAL_TARGET_X")
    private Double portalTargetX;

    @Column(name = "PORTAL_TARGET_Z")
    private Double portalTargetZ;

    @Column(name = "PORTAL_TARGET_YAW")
    private Double portalTargetYaw;

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

    public Exhibit(String title, String creator, String description,
                   String exampleText,
                   String type, String contentUrl, Integer wallIndex,
                   Double rotationY, Double scale, Boolean wide, String thumbnailUrl,
                   Double portalTargetX, Double portalTargetZ, Double portalTargetYaw,
                   Hall hall) {
        this.title = title;
        this.creator = creator;
        this.description = description;
        this.exampleText = exampleText;
        this.type = type;
        this.contentUrl = contentUrl;
        this.wallIndex = wallIndex;
        this.rotationY = rotationY;
        this.scale = scale;
        this.wide = wide;
        this.thumbnailUrl = thumbnailUrl;
        this.portalTargetX = portalTargetX;
        this.portalTargetZ = portalTargetZ;
        this.portalTargetYaw = portalTargetYaw;
        this.hall = hall;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getExampleText() { return exampleText; }
    public String getCreator() { return creator; }
    public String getType() { return type; }
    public String getContentUrl() { return contentUrl; }
    public Integer getWallIndex() { return wallIndex; }
    public Double getRotationY() { return rotationY; }
    public Double getScale() { return scale; }
    public Boolean getWide() { return wide; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public Double getPortalTargetX() { return portalTargetX; }
    public Double getPortalTargetZ() { return portalTargetZ; }
    public Double getPortalTargetYaw() { return portalTargetYaw; }
    public Hall getHall() { return hall; }
    public ExhibitPosition getPosition() { return position; }

    public void assignPosition(ExhibitPosition position) {
        this.position = position;
    }

    public void update(String title, String creator, String description,
                       String exampleText,
                       String type, String contentUrl, Integer wallIndex,
                       Double rotationY, Double scale, Boolean wide, String thumbnailUrl,
                       Double portalTargetX, Double portalTargetZ, Double portalTargetYaw,
                       Hall hall) {
        this.title = title;
        this.creator = creator;
        this.description = description;
        this.exampleText = exampleText;
        this.type = type;
        this.contentUrl = contentUrl;
        this.wallIndex = wallIndex;
        this.rotationY = rotationY;
        this.scale = scale;
        this.wide = wide;
        this.thumbnailUrl = thumbnailUrl;
        this.portalTargetX = portalTargetX;
        this.portalTargetZ = portalTargetZ;
        this.portalTargetYaw = portalTargetYaw;
        this.hall = hall;
    }
}


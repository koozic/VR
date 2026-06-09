package com.example.aiexhibition.hall;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@SuppressWarnings("JpaDataSourceORMInspection")
@Entity
//noinspection JpaDataSourceORMInspection
@Table(name = "HALLS")
public class Hall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "NAME", nullable = false, length = 100)
    private String name;

    @Lob
    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "CAMERA_Y")
    private Double cameraY;

    @Column(name = "WALL_COLOR")
    private String wallColor;

    @Column(name = "FLOOR_COLOR")
    private String floorColor;

    @Column(name = "CEILING_COLOR")
    private String ceilingColor;

    @Column(name = "AMBIENT_LIGHT_COLOR")
    private String ambientLightColor;

    @Column(name = "LIGHT_INTENSITY")
    private Double lightIntensity;

    protected Hall() {
    }

    public Hall(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public Hall(String name, String description, Double cameraY,
                String wallColor, String floorColor, String ceilingColor,
                String ambientLightColor, Double lightIntensity) {
        update(name, description, cameraY, wallColor, floorColor, ceilingColor,
                ambientLightColor, lightIntensity);
    }

    public void update(String name, String description, Double cameraY,
                       String wallColor, String floorColor, String ceilingColor,
                       String ambientLightColor, Double lightIntensity) {
        this.name = name;
        this.description = description;
        this.cameraY = cameraY;
        this.wallColor = wallColor;
        this.floorColor = floorColor;
        this.ceilingColor = ceilingColor;
        this.ambientLightColor = ambientLightColor;
        this.lightIntensity = lightIntensity;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public Double getCameraY() { return cameraY; }
    public String getWallColor() { return wallColor; }
    public String getFloorColor() { return floorColor; }
    public String getCeilingColor() { return ceilingColor; }
    public String getAmbientLightColor() { return ambientLightColor; }
    public Double getLightIntensity() { return lightIntensity; }
}


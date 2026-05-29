package com.example.aiexhibition.room;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;

@Entity
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private Double cameraY;
    @Column(name = "wall_color")
    private String wallColor;
    @Column(name = "floor_color")
    private String floorColor;
    @Column(name = "ceiling_color")
    private String ceilingColor;
    @Column(name = "ambient_light_color")
    private String ambientLightColor;
    @Column(name = "light_intensity")
    private Double lightIntensity;

    protected Room() {
    }

    public Room(String name, String description, Double cameraY,
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

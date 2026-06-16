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

    // 전시관 테이블의 기본 키다.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "NAME", nullable = false, length = 100)
    private String name;

    // 전시관 소개 문구와 3D 렌더링에 필요한 색상/조명 설정이다.
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
        // JPA가 DB 조회 결과를 객체로 만들 때 사용하는 기본 생성자다.
    }

    public Hall(String name, String description) {
        // 테스트나 간단한 생성에서 쓰는 최소 생성자다.
        this.name = name;
        this.description = description;
    }

    public Hall(String name, String description, Double cameraY,
                String wallColor, String floorColor, String ceilingColor,
                String ambientLightColor, Double lightIntensity) {
        // seed 초기화처럼 전시관의 전체 표시 설정을 한 번에 넣을 때 사용한다.
        update(name, description, cameraY, wallColor, floorColor, ceilingColor,
                ambientLightColor, lightIntensity);
    }

    public void update(String name, String description, Double cameraY,
                       String wallColor, String floorColor, String ceilingColor,
                       String ambientLightColor, Double lightIntensity) {
        // seed가 바뀌었을 때 기존 전시관 행의 이름/설명/렌더링 설정을 갱신한다.
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


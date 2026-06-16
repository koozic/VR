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

    // 작품 테이블의 기본 키다.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // AI 도슨트와 작품 상세 화면에서 쓰는 기본 설명 정보다.
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

    // 3D 갤러리에서 이미지, 모델, 포탈 등을 구분하고 렌더링 위치를 조정하는 표시 설정이다.
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

    // 포탈 작품인 경우, 이동 후 도착 위치와 바라볼 방향을 저장한다.
    @Column(name = "PORTAL_TARGET_X")
    private Double portalTargetX;

    @Column(name = "PORTAL_TARGET_Z")
    private Double portalTargetZ;

    @Column(name = "PORTAL_TARGET_YAW")
    private Double portalTargetYaw;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "HALL_ID", nullable = false)
    private Hall hall;

    // 작품의 3D 좌표는 별도 테이블로 분리되어 있어 일대일 관계로 연결한다.
    @OneToOne(mappedBy = "exhibit", fetch = FetchType.LAZY)
    private ExhibitPosition position;

    protected Exhibit() {
        // JPA가 DB 조회 결과를 객체로 만들 때 사용하는 기본 생성자다.
    }

    public Exhibit(String title, String creator, String description, Hall hall) {
        // 테스트나 간단한 seed 생성에서 쓰는 최소 생성자다.
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
        // 작품 생성 API와 seed 초기화에서 쓰는 전체 필드 생성자다.
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
        // 저장된 좌표 엔티티를 작품 엔티티에도 연결해 응답 변환 때 바로 사용할 수 있게 한다.
        this.position = position;
    }

    public void update(String title, String creator, String description,
                       String exampleText,
                       String type, String contentUrl, Integer wallIndex,
                       Double rotationY, Double scale, Boolean wide, String thumbnailUrl,
                       Double portalTargetX, Double portalTargetZ, Double portalTargetYaw,
                       Hall hall) {
        // 수정 API에서 받은 값으로 작품의 본문과 3D 표시 설정을 갱신한다.
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


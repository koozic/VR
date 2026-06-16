package com.example.aiexhibition.exhibit;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "EXHIBIT_POSITIONS")
public class ExhibitPosition {

    // 좌표 행을 구분하는 DB 기본 키다.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어떤 작품의 좌표인지 연결한다. unique=true라서 작품 하나에 좌표 하나만 허용한다.
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EXHIBIT_ID", nullable = false, unique = true)
    private Exhibit exhibit;

    // Three.js 공간에서 작품이 놓이는 X, Y, Z 좌표다.
    @Column(name = "POS_X", nullable = false)
    private Double posX;

    @Column(name = "POS_Y", nullable = false)
    private Double posY;

    @Column(name = "POS_Z", nullable = false)
    private Double posZ;

    protected ExhibitPosition() {
        // JPA가 DB 조회 결과를 객체로 만들 때 사용하는 기본 생성자다.
    }

    public ExhibitPosition(Exhibit exhibit, Double posX, Double posY, Double posZ) {
        // 작품과 좌표를 함께 묶어 새 위치 엔티티를 만들 때 사용한다.
        this.exhibit = exhibit;
        this.posX = posX;
        this.posY = posY;
        this.posZ = posZ;
    }

    public Long getId() {
        return id;
    }

    public Exhibit getExhibit() {
        return exhibit;
    }

    public Double getPosX() {
        return posX;
    }

    public Double getPosY() {
        return posY;
    }

    public Double getPosZ() {
        return posZ;
    }

    public void update(Double posX, Double posY, Double posZ) {
        // 위치 수정 API에서 받은 좌표로 기존 행을 갱신한다.
        this.posX = posX;
        this.posY = posY;
        this.posZ = posZ;
    }
}

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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EXHIBIT_ID", nullable = false, unique = true)
    private Exhibit exhibit;

    @Column(name = "POS_X", nullable = false)
    private Double posX;

    @Column(name = "POS_Y", nullable = false)
    private Double posY;

    @Column(name = "POS_Z", nullable = false)
    private Double posZ;

    protected ExhibitPosition() {
    }

    public ExhibitPosition(Exhibit exhibit, Double posX, Double posY, Double posZ) {
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
        this.posX = posX;
        this.posY = posY;
        this.posZ = posZ;
    }
}

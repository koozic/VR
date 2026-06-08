package com.example.aiexhibition.global.config;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "SEED_METADATA")
public class SeedMetadata {

    @Id
    private String name;

    private Integer version;

    protected SeedMetadata() {
    }

    public SeedMetadata(String name, Integer version) {
        this.name = name;
        this.version = version;
    }

    public Integer getVersion() {
        return version;
    }

    public void updateVersion(Integer version) {
        this.version = version;
    }
}

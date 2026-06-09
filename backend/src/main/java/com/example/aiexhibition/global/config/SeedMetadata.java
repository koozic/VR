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

    private String checksum;

    protected SeedMetadata() {
    }

    public SeedMetadata(String name, Integer version, String checksum) {
        this.name = name;
        this.version = version;
        this.checksum = checksum;
    }

    public Integer getVersion() {
        return version;
    }

    public String getChecksum() {
        return checksum;
    }

    public void update(Integer version, String checksum) {
        this.version = version;
        this.checksum = checksum;
    }
}

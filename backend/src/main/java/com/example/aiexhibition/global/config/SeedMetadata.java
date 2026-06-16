package com.example.aiexhibition.global.config;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * gallery-seed.json이 DB에 어떤 버전과 checksum으로 반영됐는지 기록하는 엔티티다.
 */
@Entity
@Table(name = "SEED_METADATA")
public class SeedMetadata {

    // seed 종류를 구분하는 이름이다. 현재는 "gallery" 한 종류를 사용한다.
    @Id
    private String name;

    // seed 파일 안에 적힌 version 값이다.
    private Integer version;

    // seed 파일 내용의 SHA-256 값이다. 같은 버전이어도 내용이 바뀌면 감지할 수 있다.
    private String checksum;

    // JPA가 DB에서 엔티티를 만들 때 사용하는 기본 생성자다.
    protected SeedMetadata() {
    }

    // seed가 처음 적용될 때 메타데이터 행을 새로 만든다.
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

    // 이미 저장된 seed 메타데이터를 최신 버전/checksum으로 갱신한다.
    public void update(Integer version, String checksum) {
        this.version = version;
        this.checksum = checksum;
    }
}

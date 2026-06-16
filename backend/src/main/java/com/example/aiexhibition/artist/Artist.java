package com.example.aiexhibition.artist;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Artist {

    // 작가 테이블의 기본 키다.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 작가 이름과 소개 문구다.
    private String name;
    private String biography;

    protected Artist() {
        // JPA가 DB 조회 결과를 객체로 만들 때 사용하는 기본 생성자다.
    }

    public Artist(String name, String biography) {
        // 새 작가 엔티티를 만들 때 사용하는 생성자다.
        this.name = name;
        this.biography = biography;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getBiography() {
        return biography;
    }
}


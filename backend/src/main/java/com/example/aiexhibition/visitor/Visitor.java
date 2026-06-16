package com.example.aiexhibition.visitor;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Visitor {

    // JPA가 관리하는 기본 키다. GenerationType.IDENTITY는 DB가 ID 생성을 맡는 방식이다.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 화면에서 방문자를 구분할 이름과, 추후 로그인/예약 확장에 쓸 수 있는 이메일이다.
    private String nickname;
    private String email;

    protected Visitor() {
        // JPA가 DB에서 엔티티를 복원할 때 사용하는 기본 생성자다.
    }

    public Visitor(String nickname, String email) {
        // 서비스 계층에서 새 방문자를 만들 때 사용하는 생성자다.
        this.nickname = nickname;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public String getNickname() {
        return nickname;
    }

    public String getEmail() {
        return email;
    }
}


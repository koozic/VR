package com.example.aiexhibition.keyword;

import com.example.aiexhibition.exhibit.Exhibit;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class ExhibitKeyword {

    // 키워드 행을 구분하는 DB 기본 키다.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // AI 도슨트가 작품의 특징을 파악할 때 참고하는 짧은 단어다.
    private String keyword;

    // 키워드는 반드시 하나의 작품에 연결된다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EXHIBIT_ID")
    private Exhibit exhibit;

    protected ExhibitKeyword() {
        // JPA가 DB 조회 결과를 객체로 만들 때 사용하는 기본 생성자다.
    }

    public ExhibitKeyword(String keyword, Exhibit exhibit) {
        // seed 초기화나 키워드 저장 로직에서 새 키워드를 만들 때 사용한다.
        this.keyword = keyword;
        this.exhibit = exhibit;
    }

    public Long getId() {
        return id;
    }

    public String getKeyword() {
        return keyword;
    }

    public Exhibit getExhibit() {
        return exhibit;
    }
}


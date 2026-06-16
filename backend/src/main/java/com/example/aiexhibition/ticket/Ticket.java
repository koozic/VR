package com.example.aiexhibition.ticket;

import com.example.aiexhibition.visitor.Visitor;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import java.time.LocalDateTime;

@Entity
public class Ticket {

    // 티켓 한 장을 구분하는 DB 기본 키다.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 발급 시각과 만료 시각을 저장해 티켓의 유효 기간을 표현한다.
    private LocalDateTime issuedAt;
    private LocalDateTime expiresAt;

    // 티켓은 한 방문자에게 발급된다. LAZY는 실제로 접근할 때 방문자 정보를 조회한다는 뜻이다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visitor_id")
    private Visitor visitor;

    protected Ticket() {
        // JPA가 DB 조회 결과를 객체로 만들 때 사용하는 기본 생성자다.
    }

    public Ticket(Visitor visitor, LocalDateTime issuedAt, LocalDateTime expiresAt) {
        // 서비스 계층에서 새 티켓을 만들 때 사용하는 생성자다.
        this.visitor = visitor;
        this.issuedAt = issuedAt;
        this.expiresAt = expiresAt;
    }

    public Long getId() {
        return id;
    }

    public Visitor getVisitor() {
        return visitor;
    }

    public LocalDateTime getIssuedAt() {
        return issuedAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
}


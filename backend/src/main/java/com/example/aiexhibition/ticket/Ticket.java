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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime issuedAt;
    private LocalDateTime expiresAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visitor_id")
    private Visitor visitor;

    protected Ticket() {
    }

    public Ticket(Visitor visitor, LocalDateTime issuedAt, LocalDateTime expiresAt) {
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


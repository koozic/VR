package com.example.aiexhibition.ticket;

import org.springframework.data.jpa.repository.JpaRepository;

// Ticket 엔티티의 기본 CRUD를 Spring Data JPA가 자동으로 만들어 주는 Repository다.
public interface TicketRepository extends JpaRepository<Ticket, Long> {
}


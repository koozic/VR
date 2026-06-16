package com.example.aiexhibition.ticket;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class TicketService {

    // Ticket 테이블의 기본 조회는 Spring Data JPA Repository에 위임한다.
    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public List<Ticket> findAll() {
        // 티켓 기능은 아직 조회 중심이라 엔티티 목록을 그대로 반환한다.
        return ticketRepository.findAll();
    }
}


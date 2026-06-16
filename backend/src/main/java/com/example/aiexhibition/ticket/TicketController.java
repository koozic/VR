package com.example.aiexhibition.ticket;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    // 티켓 조회 요청을 Service로 전달하는 HTTP 진입점이다.
    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public List<Ticket> findAll() {
        // 현재는 단순 목록 조회만 제공한다.
        return ticketService.findAll();
    }
}


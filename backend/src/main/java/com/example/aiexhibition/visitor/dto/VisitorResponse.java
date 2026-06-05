package com.example.aiexhibition.visitor.dto;

import com.example.aiexhibition.visitor.Visitor;

public record VisitorResponse(
        Long id,
        String nickname,
        String email
) {
    public static VisitorResponse from(Visitor visitor) {
        return new VisitorResponse(
                visitor.getId(),
                visitor.getNickname(),
                visitor.getEmail()
        );
    }
}

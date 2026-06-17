package com.example.aiexhibition.visitor.dto;

import com.example.aiexhibition.visitor.Visitor;

// 방문자 엔티티를 프런트엔드에 돌려줄 때 사용하는 응답 DTO다.
public record VisitorResponse(
        Long id,
        String nickname,
        String email
) {
    public static VisitorResponse from(Visitor visitor) {
        // Entity -> DTO 변환을 한 곳에 모아 두면 Controller와 Service 코드가 짧아진다.
        return new VisitorResponse(
                visitor.getId(),
                visitor.getNickname(),
                visitor.getEmail()
        );
    }
}

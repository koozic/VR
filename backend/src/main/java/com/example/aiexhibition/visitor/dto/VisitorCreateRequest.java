package com.example.aiexhibition.visitor.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// 방문자 생성 API가 받는 요청 DTO다.
public record VisitorCreateRequest(
        // 닉네임은 화면에 표시되므로 비워 둘 수 없고, 너무 긴 이름은 제한한다.
        @NotBlank
        @Size(max = 50)
        String nickname,

        // 이메일은 선택 입력이지만, 값이 있으면 이메일 형식과 길이를 검사한다.
        @Email
        @Size(max = 100)
        String email
) {
}

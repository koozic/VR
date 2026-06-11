package com.example.aiexhibition;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AiExhibitionApplication {

    public static void main(String[] args) {
        // 컴포넌트 스캔, 자동 설정, 내장 웹 서버를 시작하는 백엔드 진입점이다.
        SpringApplication.run(AiExhibitionApplication.class, args);
    }
}


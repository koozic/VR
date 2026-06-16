package com.example.aiexhibition;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

// Spring Boot 애플리케이션의 시작 버튼 역할을 하는 클래스다.
@SpringBootApplication
// WebSocket heartbeat 정리처럼 주기적으로 실행되는 작업을 사용할 수 있게 켠다.
@EnableScheduling
public class AiExhibitionApplication {

    public static void main(String[] args) {
        // 컴포넌트 스캔, 자동 설정, 내장 웹 서버를 시작하는 백엔드 진입점이다.
        SpringApplication.run(AiExhibitionApplication.class, args);
    }
}


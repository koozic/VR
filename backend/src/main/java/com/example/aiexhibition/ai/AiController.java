package com.example.aiexhibition.ai;

import com.example.aiexhibition.ai.dto.AiExplainRequest;
import com.example.aiexhibition.ai.dto.AiExplainResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    // Controller는 HTTP 요청 형식을 처리하고, 실제 업무 로직은 Service에 위임한다.
    private final AiService aiService;
    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/explain")
    public AiExplainResponse explain(@Valid @RequestBody AiExplainRequest request) {
        // @RequestBody가 JSON을 DTO로 변환하고 @Valid가 DTO의 길이/양수 조건을 검사한다.
        return aiService.explain(request);
    }
}


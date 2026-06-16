package com.example.aiexhibition.ai;

import com.example.aiexhibition.ai.dto.AiExplainRequest;
import com.example.aiexhibition.ai.dto.AiExplainResponse;
import com.example.aiexhibition.ai.dto.WebLlmExplainRequest;
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
        // Service는 작품 정보 보강, FastAPI 호출, WebLLM fallback 판단을 담당한다.
        return aiService.explain(request);
    }

    @PostMapping("/explain/web-llm")
    public AiExplainResponse acceptWebLlmExplanation(
            @Valid @RequestBody WebLlmExplainRequest request
    ) {
        // 브라우저에서 WebLLM이 만든 답변을 백엔드 응답 형식으로 맞춰 돌려준다.
        return aiService.acceptWebLlmExplanation(request);
    }
}


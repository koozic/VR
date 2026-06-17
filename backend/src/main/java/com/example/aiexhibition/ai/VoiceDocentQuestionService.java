package com.example.aiexhibition.ai;

import com.example.aiexhibition.ai.dto.AiExplainResponse;
import com.example.aiexhibition.ai.dto.VoiceDocentQuestionRequest;
import com.example.aiexhibition.ai.dto.VoiceDocentQuestionResponse;
import org.springframework.stereotype.Service;

@Service
public class VoiceDocentQuestionService {

    private final AiService aiService;

    public VoiceDocentQuestionService(AiService aiService) {
        this.aiService = aiService;
    }

    public VoiceDocentQuestionResponse answer(VoiceDocentQuestionRequest request) {
        AiExplainResponse response = aiService.explainVoiceDocentQuestion(request.toAiExplainRequest());
        return VoiceDocentQuestionResponse.from(response);
    }
}

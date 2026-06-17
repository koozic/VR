package com.example.aiexhibition.ai;

import com.example.aiexhibition.ai.dto.AiExplainRequest;
import com.example.aiexhibition.ai.dto.FastApiExplainResponse;
import org.springframework.stereotype.Component;

@Component
public class VoiceDocentQuestionClient {

    private final FastApiClient fastApiClient;

    public VoiceDocentQuestionClient(FastApiClient fastApiClient) {
        this.fastApiClient = fastApiClient;
    }

    public FastApiExplainResponse requestAnswer(AiExplainRequest request) {
        return fastApiClient.requestVoiceDocentQuestionAnswer(request);
    }
}

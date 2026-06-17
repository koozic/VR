package com.example.aiexhibition.ai;

import com.example.aiexhibition.ai.dto.VoiceDocentQuestionRequest;
import com.example.aiexhibition.ai.dto.VoiceDocentQuestionResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class VoiceDocentQuestionController {

    private final VoiceDocentQuestionService voiceDocentQuestionService;

    public VoiceDocentQuestionController(VoiceDocentQuestionService voiceDocentQuestionService) {
        this.voiceDocentQuestionService = voiceDocentQuestionService;
    }

    @PostMapping("/voice-docent-question")
    public VoiceDocentQuestionResponse answer(
            @Valid @RequestBody VoiceDocentQuestionRequest request
    ) {
        return voiceDocentQuestionService.answer(request);
    }
}

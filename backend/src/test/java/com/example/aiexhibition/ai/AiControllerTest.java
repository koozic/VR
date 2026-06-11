package com.example.aiexhibition.ai;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.aiexhibition.ai.dto.AiExplainRequest;
import com.example.aiexhibition.ai.dto.AiExplainResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AiController.class)
class AiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AiService aiService;

    @Test
    void rejectsRequestWithoutArtworkTarget() throws Exception {
        mockMvc.perform(post("/api/ai/explain")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("artworkId, title, or userPosition must be provided"));

        verifyNoInteractions(aiService);
    }

    @Test
    void rejectsPositionRequestWithoutHallId() throws Exception {
        mockMvc.perform(post("/api/ai/explain")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userPosition": {"x": 1.0, "y": 2.0, "z": 3.0}
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("hallId is required when userPosition is provided"));

        verifyNoInteractions(aiService);
    }

    @Test
    void returnsExpandedResponseContract() throws Exception {
        when(aiService.explain(any(AiExplainRequest.class)))
                .thenReturn(AiExplainResponse.generated("생성된 설명"));

        mockMvc.perform(post("/api/ai/explain")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "artworkId": 7,
                                  "title": "테스트 작품"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("생성된 설명"))
                .andExpect(jsonPath("$.generated").value(true))
                .andExpect(jsonPath("$.status").value("GENERATED"))
                .andExpect(jsonPath("$.provider").value("GEMINI"))
                .andExpect(jsonPath("$.failureReason").doesNotExist())
                .andExpect(jsonPath("$.localContext").doesNotExist());
    }

    @Test
    void acceptsWebLlmResponseAndReturnsExpandedResponseContract() throws Exception {
        when(aiService.acceptWebLlmExplanation(any()))
                .thenReturn(AiExplainResponse.webLlmGenerated("WebLLM 설명"));

        mockMvc.perform(post("/api/ai/explain/web-llm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "message": "WebLLM 설명",
                                  "modelId": "Llama-3.2-1B-Instruct-q4f16_1-MLC"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("WebLLM 설명"))
                .andExpect(jsonPath("$.generated").value(true))
                .andExpect(jsonPath("$.status").value("GENERATED"))
                .andExpect(jsonPath("$.provider").value("WEB_LLM"));
    }
}

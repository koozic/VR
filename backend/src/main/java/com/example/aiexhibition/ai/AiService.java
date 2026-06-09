package com.example.aiexhibition.ai;

import com.example.aiexhibition.ai.dto.AiExplainRequest;
import com.example.aiexhibition.ai.dto.AiExplainResponse;
import com.example.aiexhibition.exhibit.ExhibitService;
import com.example.aiexhibition.exhibit.dto.ExhibitResponse;
import com.example.aiexhibition.keyword.ExhibitKeywordService;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AiService {

    // FastAPI 또는 Gemini 장애가 발생해도 프런트엔드에 일정한 응답 형식을 돌려준다.
    private static final Logger log = LoggerFactory.getLogger(AiService.class);
    private static final String FALLBACK_MESSAGE = "AI 도슨트 응답을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.";

    private final FastApiClient fastApiClient;
    private final ExhibitService exhibitService;
    private final ExhibitKeywordService exhibitKeywordService;

    public AiService(
            FastApiClient fastApiClient,
            ExhibitService exhibitService,
            ExhibitKeywordService exhibitKeywordService
    ) {
        this.fastApiClient = fastApiClient;
        this.exhibitService = exhibitService;
        this.exhibitKeywordService = exhibitKeywordService;
    }

    public AiExplainResponse explain(AiExplainRequest request) {
        // 1. 좌표가 있으면 가까운 작품으로 요청을 바꾸고, 2. 빠진 키워드를 DB에서 보충한다.
        AiExplainRequest resolvedRequest = enrichKeywords(resolveNearestExhibit(request));
        AiExplainResponse response;
        try {
            // 3. 완성된 작품 정보와 질문을 FastAPI AI 서버로 전달한다.
            response = fastApiClient.requestExplanation(resolvedRequest);
        } catch (FastApiClientException ex) {
            log.warn("Failed to request AI explanation from FastAPI server.", ex);
            return new AiExplainResponse(FALLBACK_MESSAGE, false);
        }

        if (response == null || response.message() == null || response.message().isBlank()) {
            // HTTP 호출은 성공했어도 설명문이 비어 있으면 정상 생성으로 처리하지 않는다.
            return new AiExplainResponse(FALLBACK_MESSAGE, false);
        }
        return new AiExplainResponse(response.message(), true);
    }

    private AiExplainRequest resolveNearestExhibit(AiExplainRequest request) {
        if (request.userPosition() == null) {
            // 좌표가 없으면 프런트엔드가 보낸 작품 ID/제목 정보를 그대로 사용한다.
            return request;
        }

        AiExplainRequest.UserPosition position = request.userPosition();
        // 같은 전시관 안에서 관람객 좌표와 가장 가까운 일반 작품을 찾는다.
        ExhibitResponse exhibit = exhibitService.findNearest(
                position.x(),
                position.y(),
                position.z(),
                request.hallId(),
                request.maxDistance()
        );

        // 작품 검색은 끝났으므로 userPosition은 null로 바꿔 FastAPI가 좌표 검색을 다시 하지 않게 한다.
        return new AiExplainRequest(
                exhibit.id(),
                exhibit.title(),
                exhibit.creator(),
                exhibit.description(),
                exhibit.keywords(),
                exhibit.exampleText(),
                request.userQuestion(),
                null,
                request.hallId(),
                request.maxDistance()
        );
    }

    private AiExplainRequest enrichKeywords(AiExplainRequest request) {
        // 작품 ID가 없거나 이미 키워드가 포함된 요청은 추가 DB 조회가 필요 없다.
        if (request.exhibitId() == null || (request.keywords() != null && !request.keywords().isEmpty())) {
            return request;
        }

        // 키워드는 Gemini가 작품의 핵심 요소를 놓치지 않도록 프롬프트에 함께 전달된다.
        List<String> keywords = exhibitKeywordService.findKeywordsByExhibitId(request.exhibitId());
        if (keywords.isEmpty()) {
            return request;
        }

        return new AiExplainRequest(
                request.exhibitId(),
                request.title(),
                request.creator(),
                request.description(),
                keywords,
                request.exampleText(),
                request.userQuestion(),
                request.userPosition(),
                request.hallId(),
                request.maxDistance()
        );
    }
}

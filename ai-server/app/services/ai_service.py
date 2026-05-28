from app.clients.external_ai_client import ExternalAiClient
from app.core.prompt_templates import build_artwork_explanation_prompt
from app.schemas.ai_request import AiExplainRequest
from app.schemas.ai_response import AiExplainResponse

# 가짜 데이터베이스 역할 (더미 데이터)
MOCK_ARTWORKS = {
    1: {
        "title": "별이 빛나는 밤 (The Starry Night)",
        "artist": "빈센트 반 고흐 (Vincent van Gogh)",
        "description": "1889년 작품으로, 요동치는 꿈틀거리는 듯한 붓놀림과 강렬한 푸른색, 소용돌이치는 노란 별빛이 특징인 후기 인상주의의 대표작입니다."
    },
    2: {
        "title": "진주 귀걸이를 한 소녀 (Girl with a Pearl Earring)",
        "artist": "요하네스 페르메이르 (Johannes Vermeer)",
        "description": "1665년경 작품으로, 어두운 배경 속에서 신비로운 눈빛으로 관객을 바라보는 소녀와 빛을 받아 반짝이는 커다란 진주 귀걸이가 매력적인 북유럽의 모나리자라 불리는 작품입니다."
    },
    3: {
        "title": "기기묘묘한 미술관 (The Digital Gallery)",
        "artist": "알 수 없는 디지털 아티스트",
        "description": "3D 가상 공간 속에 구현된 현대적인 미술관으로, 관객의 시선과 좌표에 따라 실시간으로 상호작용하는 혁신적인 가상 전시 공간입니다."
    }
}


class TempRequest:
    def __init__(self, title: str, artist_name: str, description: str):
        self.title = title
        self.artist_name = artist_name  # 👈 기존 self.artist에서 명칭 변경!
        self.description = description


class AiService:
    def __init__(self) -> None:
        self.external_ai_client = ExternalAiClient()

    async def explain_artwork(self, request: AiExplainRequest) -> AiExplainResponse:
        artwork_id = request.artwork_id

        # 더미 데이터 조회
        artwork_info = MOCK_ARTWORKS.get(
            artwork_id,
            {
                "title": "미상",
                "artist": "작자 미상",
                "description": "가상의 전시 공간입니다."
            }
        )

        # 📌 값을 생성해서 클래스에 집어넣을 때도 artist_name 변수명으로 매칭합니다.
        temp_request = TempRequest(
            title=artwork_info["title"],
            artist_name=artwork_info["artist"],  # 👈 딕셔너리의 "artist" 값을 artist_name 칸에 주입
            description=artwork_info["description"]
        )

        # 프롬프트 빌더 함수에 전달
        prompt = build_artwork_explanation_prompt(temp_request)

        # 제미나이 호출 및 응답
        message = await self.external_ai_client.generate_text(prompt)
        return AiExplainResponse(message=message)
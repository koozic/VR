import unittest

from fastapi.testclient import TestClient

from app.main import app
from app.routers.ai_router import ai_service
from gallery_seed_fixture import starry_night_exhibit


class CapturingAiClient:
    def __init__(self, message: str | None = None) -> None:
        self.prompt = ""
        self.message = message

    async def generate_text(self, prompt: str) -> str:
        self.prompt = prompt
        return self.message or (
            "푸른 밤하늘의 소용돌이는 화면 전체에 강한 움직임을 만듭니다. "
            "밝은 노란 별빛은 어두운 마을과 선명한 대비를 이루며 시선을 끕니다. "
            "후기 인상주의 특유의 힘찬 표현을 떠올리며 붓놀림의 방향을 따라가 보세요."
        )


class AiEndpointTest(unittest.TestCase):
    def test_keywords_and_example_reach_generation_prompt(self) -> None:
        original_client = ai_service._external_ai_client
        capturing_client = CapturingAiClient()
        exhibit = starry_night_exhibit()
        ai_service._external_ai_client = capturing_client
        try:
            response = TestClient(app).post(
                "/ai/explain",
                json={
                    "artworkId": exhibit["id"],
                    "title": exhibit["title"],
                    "artistName": exhibit["creator"],
                    "description": exhibit["description"],
                    "keywords": exhibit["keywords"],
                    "exampleText": exhibit["exampleText"],
                },
            )
        finally:
            ai_service._external_ai_client = original_client

        self.assertEqual(response.status_code, 200)
        self.assertIn("푸른 밤하늘", response.json()["message"])
        self.assertIn(", ".join(exhibit["keywords"]), capturing_client.prompt)
        self.assertIn(exhibit["exampleText"], capturing_client.prompt)

    def test_wrong_creator_is_replaced_with_grounded_fallback(self) -> None:
        original_client = ai_service._external_ai_client
        capturing_client = CapturingAiClient(
            "Star Field는 빈센트 반 고흐의 작품입니다."
        )
        ai_service._external_ai_client = capturing_client
        try:
            response = TestClient(app).post(
                "/ai/explain",
                json={
                    "artworkId": 34,
                    "title": "Star Field",
                    "artistName": "AI Exhibition Studio",
                    "description": "우주 풍경을 담은 작품입니다.",
                },
            )
        finally:
            ai_service._external_ai_client = original_client

        self.assertEqual(response.status_code, 200)
        self.assertNotIn("빈센트 반 고흐", response.json()["message"])
        self.assertIn("AI Exhibition Studio", response.json()["message"])
        self.assertIn("우주 풍경을 담은 작품입니다.", response.json()["message"])


if __name__ == "__main__":
    unittest.main()

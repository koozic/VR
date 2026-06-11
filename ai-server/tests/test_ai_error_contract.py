import unittest

from fastapi.testclient import TestClient

from app.clients.external_ai_client import (
    ExternalAiClientGenerationError,
    ExternalAiClientQuotaError,
)
from app.main import app
from app.routers.ai_router import ai_service


class FailingAiClient:
    def __init__(self, error: Exception) -> None:
        self.error = error

    async def generate_text(self, _prompt: str) -> str:
        raise self.error


class AiErrorContractTest(unittest.TestCase):
    def request_explanation_with(self, error: Exception):
        original_client = ai_service._external_ai_client
        ai_service._external_ai_client = FailingAiClient(error)
        try:
            return TestClient(app).post(
                "/ai/explain",
                json={
                    "artworkId": 1,
                    "title": "별이 빛나는 밤",
                    "artistName": "빈센트 반 고흐",
                    "description": "밤하늘을 표현한 작품입니다.",
                },
            )
        finally:
            ai_service._external_ai_client = original_client

    def test_quota_error_has_stable_code_and_message_shape(self):
        response = self.request_explanation_with(
            ExternalAiClientQuotaError("quota exhausted")
        )

        self.assertEqual(response.status_code, 429)
        self.assertEqual(
            response.json(),
            {
                "code": "GEMINI_QUOTA_EXHAUSTED",
                "message": "Gemini 무료 할당량을 모두 사용했습니다.",
            },
        )

    def test_generation_error_uses_same_error_shape(self):
        response = self.request_explanation_with(
            ExternalAiClientGenerationError("generation failed")
        )

        self.assertEqual(response.status_code, 502)
        self.assertEqual(
            response.json(),
            {
                "code": "AI_GENERATION_FAILED",
                "message": "AI 응답 생성에 실패했습니다. 잠시 후 다시 시도해주세요.",
            },
        )


if __name__ == "__main__":
    unittest.main()

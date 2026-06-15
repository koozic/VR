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
                    "title": "Starry Night",
                    "artistName": "Vincent van Gogh",
                    "description": "A swirling night sky over a quiet village.",
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

    def test_coordinate_only_request_does_not_query_artwork_in_fastapi(self):
        response = TestClient(app).post(
            "/ai/explain",
            json={
                "userPosition": {"x": 1.0, "y": 2.0, "z": 3.0},
                "hallId": 1,
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["code"], "ARTWORK_CONTEXT_REQUIRED")
        self.assertIn("작품을 직접 조회하지 않습니다", response.json()["message"])

    def test_validation_error_uses_same_error_shape(self):
        response = TestClient(app).post("/ai/explain", json={"artworkId": 0})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(),
            {
                "code": "INVALID_REQUEST",
                "message": "요청 형식이 올바르지 않습니다.",
            },
        )

    def test_request_id_header_is_preserved(self):
        response = TestClient(app).post(
            "/ai/explain",
            headers={"X-Request-ID": "test-request-id"},
            json={
                "userPosition": {"x": 1.0, "y": 2.0, "z": 3.0},
                "hallId": 1,
            },
        )

        self.assertEqual(response.headers["x-request-id"], "test-request-id")

    def test_health_reports_gemini_metrics_and_db_boundary(self):
        response = TestClient(app).get("/health")

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertIn("failureRate", body["dependencies"]["gemini"]["metrics"])
        self.assertEqual(body["dependencies"]["database"]["status"], "not_applicable")


if __name__ == "__main__":
    unittest.main()

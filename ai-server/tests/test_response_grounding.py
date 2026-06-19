import unittest

from app.core.response_grounding import create_grounded_fallback, ground_ai_response
from app.schemas.ai_request import AiExplainRequest


class ResponseGroundingTest(unittest.TestCase):
    def setUp(self) -> None:
        self.request = AiExplainRequest(
            artworkId=34,
            title="Star Field",
            artistName="AI Exhibition Studio",
            description="우주 풍경을 담은 작품입니다.",
        )

    def test_wrong_creator_claim_uses_stored_description(self) -> None:
        message = "Star Field는 빈센트 반 고흐의 작품입니다."

        grounded = ground_ai_response(message, self.request)

        self.assertEqual(grounded, create_grounded_fallback(self.request))
        self.assertNotIn("빈센트 반 고흐", grounded)

    def test_expected_creator_claim_is_kept(self) -> None:
        message = "Star Field의 제작자는 AI Exhibition Studio입니다."

        self.assertEqual(ground_ai_response(message, self.request), message)

    def test_visual_description_without_creator_claim_is_kept(self) -> None:
        message = "푸른 행성과 보랏빛 성운이 화면 전체에 펼쳐집니다."

        self.assertEqual(ground_ai_response(message, self.request), message)

    def test_generic_reference_to_creator_is_kept(self) -> None:
        message = "작가가 사용한 푸른색이 화면 전체에 차분한 분위기를 만듭니다."

        self.assertEqual(ground_ai_response(message, self.request), message)


if __name__ == "__main__":
    unittest.main()

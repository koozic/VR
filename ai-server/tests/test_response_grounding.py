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

    def test_unsupported_year_uses_stored_description(self) -> None:
        message = "Star Field는 1912년에 제작된 우주 풍경 작품입니다."

        grounded = ground_ai_response(message, self.request)

        self.assertEqual(grounded, create_grounded_fallback(self.request))
        self.assertNotIn("1912", grounded)

    def test_unsupported_latin_word_uses_stored_description(self) -> None:
        message = "Star Field는 NASA의 우주 관측 이미지를 바탕으로 한 작품입니다."

        grounded = ground_ai_response(message, self.request)

        self.assertEqual(grounded, create_grounded_fallback(self.request))
        self.assertNotIn("NASA", grounded)

    def test_broken_memorial_purpose_uses_stored_description(self) -> None:
        request = AiExplainRequest(
            artworkId=35,
            title="승리의 여신 (Mourning Victory)",
            artistName="대니얼 체스터 프렌치 (Daniel Chester French)",
            description=(
                "1908년 미국 조각가 대니얼 체스터 프렌치가 제작한 대리석 조각상입니다. "
                "1차 세계대전 전몰자를 추모하는 기념비의 일부입니다."
            ),
        )
        message = "이 작품은 1차 세계대전 전몰자들을 묵시우기 위해 만들어진 작품입니다."

        grounded = ground_ai_response(message, request)

        self.assertEqual(grounded, create_grounded_fallback(request))
        self.assertIn("추모하는 기념비", grounded)

    def test_supported_memorial_purpose_is_kept(self) -> None:
        request = AiExplainRequest(
            artworkId=35,
            title="승리의 여신 (Mourning Victory)",
            artistName="대니얼 체스터 프렌치 (Daniel Chester French)",
            description=(
                "1908년 미국 조각가 대니얼 체스터 프렌치가 제작한 대리석 조각상입니다. "
                "1차 세계대전 전몰자를 추모하는 기념비의 일부입니다."
            ),
        )
        message = "이 작품은 1차 세계대전 전몰자를 기리기 위해 만들어진 기념비의 일부입니다."

        self.assertEqual(ground_ai_response(message, request), message)


if __name__ == "__main__":
    unittest.main()

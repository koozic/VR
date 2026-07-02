import unittest

from app.core.prompt_templates import build_artwork_explanation_prompt
from app.schemas.ai_request import AiExplainRequest
from gallery_seed_fixture import starry_night_exhibit


class PromptTemplateTest(unittest.TestCase):
    def test_includes_keywords_example_and_question(self) -> None:
        exhibit = starry_night_exhibit()
        request = AiExplainRequest.model_validate({
            "artworkId": exhibit["id"],
            "title": exhibit["title"],
            "artistName": exhibit["creator"],
            "description": exhibit["description"],
            "keywords": exhibit["keywords"],
            "exampleText": exhibit["exampleText"],
            "docentContext": "{\"focusPoints\":[\"소용돌이치는 붓질\"]}",
            "userQuestion": "붓놀림의 특징은 무엇인가요?",
        })

        prompt = build_artwork_explanation_prompt(request)

        self.assertIn("[핵심 키워드]", prompt)
        self.assertIn(", ".join(exhibit["keywords"]), prompt)
        self.assertIn("[설명문 참고 예시 - 사실 근거가 아닌 문체 참고용]", prompt)
        self.assertIn(exhibit["exampleText"], prompt)
        self.assertIn("[작품 보강 문맥 - 검증된 사실 근거]", prompt)
        self.assertIn("소용돌이치는 붓질", prompt)
        self.assertIn("붓놀림의 특징은 무엇인가요?", prompt)

    def test_omits_optional_sections_when_not_provided(self) -> None:
        prompt = build_artwork_explanation_prompt(
            AiExplainRequest(title="테스트 작품", description="테스트 설명")
        )

        self.assertNotIn("[핵심 키워드]", prompt)
        self.assertNotIn("[설명문 참고 예시", prompt)
        self.assertNotIn("[작품 보강 문맥", prompt)
        self.assertNotIn("[관람객 질문", prompt)


if __name__ == "__main__":
    unittest.main()

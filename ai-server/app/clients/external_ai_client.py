import os

from dotenv import load_dotenv

load_dotenv()


class ExternalAiClient:
    def __init__(self) -> None:
        self.api_key = os.getenv("EXTERNAL_AI_API_KEY", "")
        self.model = os.getenv("EXTERNAL_AI_MODEL", "")

    def generate_text(self, prompt: str) -> str:
        if not self.api_key:
            return "이 작품은 색감과 구도를 통해 관람자가 천천히 머물며 해석할 여지를 남깁니다."

        # Replace this stub with the provider SDK call used by your team.
        return f"AI 해설 생성 준비가 완료되었습니다. prompt_length={len(prompt)}, model={self.model or 'default'}"


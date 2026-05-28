import os
from dotenv import load_dotenv
from google import genai
from google.genai import errors  # 구글 전용 에러를 잡기 위해 추가

load_dotenv()


class ExternalAiClient:
    def __init__(self) -> None:
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.model = os.getenv("EXTERNAL_AI_MODEL", "gemini-2.5-flash")

        self.client = None
        if self.api_key:
            # 공백이나 따옴표가 섞여 들어오는 것을 방지하기 위해 strip() 처리
            self.client = genai.Client(api_key=self.api_key.strip())

    async def generate_text(self, prompt: str) -> str:
        if not self.api_key or not self.client:
            return "이 작품은 색감과 구도를 통해 관람자가 천천히 머물며 해석할 여지를 남깁니다. (API 키 미설정)"

        try:
            # 📌 핵심 수정: async 함수 내에선 구글의 비동기 전용 메서드인 `client.aio`를 사용해야 합니다.
            # 앞에 반드시 `await`를 붙여서 구글 서버의 응답을 기다립니다.
            response = await self.client.aio.models.generate_content(
                model=self.model,
                contents=prompt,
            )
            return response.text

        except errors.APIError as api_err:
            # 구글 서버단에서 내린 에러 (예: 400 잘못된 키, 403 권한 없음 등)
            return f"구글 제미나이 서버 에러 (키를 다시 확인해보세요): {api_err.message} (Status Code: {api_err.code})"
        except Exception as e:
            # 그 외 시스템이나 네트워크 에러
            return f"시스템 통신 에러 발생: {str(e)}"
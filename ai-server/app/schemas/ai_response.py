from pydantic import BaseModel


class AiExplainResponse(BaseModel):
    """AI 서버가 반환하는 최소 응답 형식."""

    message: str


from enum import Enum

from pydantic import BaseModel


class AiErrorCode(str, Enum):
    """Spring Boot가 분기 처리할 수 있도록 고정한 AI 오류 코드."""

    GEMINI_QUOTA_EXHAUSTED = "GEMINI_QUOTA_EXHAUSTED"
    GEMINI_AUTH_FAILED = "GEMINI_AUTH_FAILED"
    AI_SERVER_CONFIGURATION_ERROR = "AI_SERVER_CONFIGURATION_ERROR"
    AI_GENERATION_FAILED = "AI_GENERATION_FAILED"


class AiErrorResponse(BaseModel):
    """FastAPI가 AI 생성 실패 시 반환하는 공통 JSON 형식."""

    code: AiErrorCode
    message: str

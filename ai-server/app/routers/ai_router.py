from fastapi import APIRouter, File, Form, UploadFile

from app.schemas.ai_request import AiExplainRequest
from app.schemas.ai_response import AiExplainResponse
from app.services.ai_service import AiService

router = APIRouter()
# 서비스 객체는 실제 작품 조회, 프롬프트 생성, Gemini 호출을 담당한다.
ai_service = AiService()


@router.post("/explain", response_model=AiExplainResponse)
async def explain_artwork(request: AiExplainRequest) -> AiExplainResponse:
    """JSON으로 받은 작품 정보와 질문을 서비스 계층에 전달한다."""
    return await ai_service.explain_artwork(request)


@router.post("/explain/audio", response_model=AiExplainResponse)
async def explain_artwork_with_audio(
    artwork_id: int = Form(..., alias="artworkId", ge=1, description="작품 ID"),
    audio_file: UploadFile = File(..., description="사용자 음성 질문 파일 (.mp3, .wav 등)"),
) -> AiExplainResponse:
    """multipart/form-data로 받은 작품 ID와 음성 파일을 서비스 계층에 전달한다."""
    return await ai_service.explain_artwork_with_audio(artwork_id, audio_file)

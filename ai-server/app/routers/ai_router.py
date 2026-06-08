from fastapi import APIRouter, File, Form, UploadFile

from app.schemas.ai_request import AiExplainRequest
from app.schemas.ai_response import AiExplainResponse
from app.services.ai_service import AiService

router = APIRouter()
ai_service = AiService()


@router.post("/explain", response_model=AiExplainResponse)
async def explain_artwork(request: AiExplainRequest) -> AiExplainResponse:
    """작품 정보와 사용자 질문을 바탕으로 텍스트 AI 도슨트 설명을 생성합니다."""
    return await ai_service.explain_artwork(request)


@router.post("/explain/audio", response_model=AiExplainResponse)
async def explain_artwork_with_audio(
    artwork_id: int = Form(..., alias="artworkId", ge=1, description="작품 ID"),
    audio_file: UploadFile = File(..., description="사용자 음성 질문 파일 (.mp3, .wav 등)"),
) -> AiExplainResponse:
    """음성 질문 파일과 작품 ID를 바탕으로 AI 도슨트 설명을 생성합니다."""
    return await ai_service.explain_artwork_with_audio(artwork_id, audio_file)

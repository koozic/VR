from fastapi import APIRouter, UploadFile, File, Form

from app.schemas.ai_request import AiExplainRequest
from app.schemas.ai_response import AiExplainResponse
from app.services.ai_service import AiService

router = APIRouter()
ai_service = AiService()


# 1. 📝 기존 텍스트 기반 도슨트 해설 엔드포인트 (그대로 유지)
@router.post("/explain", response_model=AiExplainResponse)
async def explain_artwork(request: AiExplainRequest) -> AiExplainResponse:
    # 📌 반드시 앞에 await를 붙여서 서비스가 완전히 끝날 때까지 기다립니다.
    return await ai_service.explain_artwork(request)


# 2. 🎙️ 새로 추가되는 음성 파일 기반 도슨트 해설 엔드포인트
@router.post("/explain/audio", response_model=AiExplainResponse)
async def explain_artwork_with_audio(
    artwork_id: int = Form(..., alias="artworkId", ge=1, description="작품 ID (1, 2, 3 등)"),
    audio_file: UploadFile = File(..., description="마이크로 녹음한 음성 파일 (.mp3, .wav 등)")
) -> AiExplainResponse:
    """
    관람객이 마이크로 녹음한 음성 파일을 직접 업로드하면,
    구글 제미나이가 귀로 듣고 해석해서 해당 작품에 맞는 맞춤형 답변을 300자 내외로 리턴합니다.
    """
    return await ai_service.explain_artwork_with_audio(artwork_id, audio_file)

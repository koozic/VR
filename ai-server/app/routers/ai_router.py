from fastapi import APIRouter

from app.schemas.ai_request import AiExplainRequest
from app.schemas.ai_response import AiExplainResponse
from app.services.ai_service import AiService

router = APIRouter()
ai_service = AiService()


@router.post("/explain", response_model=AiExplainResponse)
async def explain_artwork(request: AiExplainRequest) -> AiExplainResponse:
    # 📌 반드시 앞에 await를 붙여서 서비스가 완전히 끝날 때까지 기다립니다.
    return await ai_service.explain_artwork(request)
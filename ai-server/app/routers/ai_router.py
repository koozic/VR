 from fastapi import APIRouter

from app.schemas.ai_request import AiExplainRequest
from app.schemas.ai_response import AiExplainResponse
from app.services.ai_service import AiService

router = APIRouter()
ai_service = AiService()


@router.post("/explain", response_model=AiExplainResponse)

def explain_artwork(request: AiExplainRequest) -> AiExplainResponse:
    return ai_service.explain_artwork(request)


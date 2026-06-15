from fastapi import APIRouter, File, Form, UploadFile

from app.schemas.ai_error import AiErrorResponse
from app.schemas.ai_request import AiExplainRequest
from app.schemas.ai_response import AiExplainResponse
from app.services.ai_service import AiService

router = APIRouter()
ai_service = AiService()

AI_ERROR_RESPONSES = {
    400: {
        "model": AiErrorResponse,
        "description": "Invalid request or missing Spring-provided artwork context",
    },
    413: {
        "model": AiErrorResponse,
        "description": "Audio payload is too large",
    },
    415: {
        "model": AiErrorResponse,
        "description": "Unsupported audio media type",
    },
    429: {
        "model": AiErrorResponse,
        "description": "Gemini API quota exhausted",
    },
    502: {
        "model": AiErrorResponse,
        "description": "External AI generation failed",
    },
    503: {
        "model": AiErrorResponse,
        "description": "AI server configuration or Gemini authentication failed",
    },
}


@router.post(
    "/explain",
    response_model=AiExplainResponse,
    responses=AI_ERROR_RESPONSES,
)
async def explain_artwork(request: AiExplainRequest) -> AiExplainResponse:
    return await ai_service.explain_artwork(request)


@router.post(
    "/explain/audio",
    response_model=AiExplainResponse,
    responses=AI_ERROR_RESPONSES,
)
async def explain_artwork_with_audio(
    artwork_id: int = Form(..., alias="artworkId", ge=1, description="Artwork ID"),
    title: str | None = Form(default=None, min_length=1, max_length=200),
    artist_name: str | None = Form(default=None, alias="artistName", max_length=200),
    description: str | None = Form(default=None, max_length=1000),
    audio_file: UploadFile = File(..., description="Visitor audio question"),
) -> AiExplainResponse:
    request = AiExplainRequest(
        artwork_id=artwork_id,
        title=title,
        artist_name=artist_name,
        description=description,
    )
    return await ai_service.explain_artwork_with_audio(request, audio_file)

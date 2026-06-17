from fastapi import APIRouter

from app.routers.ai_router import AI_ERROR_RESPONSES
from app.schemas.voice_docent_question_request import VoiceDocentQuestionRequest
from app.schemas.voice_docent_question_response import VoiceDocentQuestionResponse
from app.services.voice_docent_question_service import VoiceDocentQuestionService

router = APIRouter()
voice_docent_question_service = VoiceDocentQuestionService()


@router.post(
    "/voice-docent-question",
    response_model=VoiceDocentQuestionResponse,
    responses=AI_ERROR_RESPONSES,
)
async def answer_voice_docent_question(
    request: VoiceDocentQuestionRequest,
) -> VoiceDocentQuestionResponse:
    return await voice_docent_question_service.answer_voice_docent_question(request)

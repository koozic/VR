import logging

from app.clients.external_ai_client import ExternalAiClientError
from app.core.ai_errors import AiApiError
from app.core.response_grounding import ground_ai_response
from app.core.voice_docent_question_prompt import build_voice_docent_question_prompt
from app.schemas.voice_docent_question_request import VoiceDocentQuestionRequest
from app.schemas.voice_docent_question_response import VoiceDocentQuestionResponse
from app.services.ai_service import AiService, _map_ai_error, _require_artwork_context

logger = logging.getLogger(__name__)


class VoiceDocentQuestionService(AiService):
    """Generates AI docent answers for a visitor's voice question text."""

    async def answer_voice_docent_question(
        self,
        request: VoiceDocentQuestionRequest,
    ) -> VoiceDocentQuestionResponse:
        _require_artwork_context(request)
        prompt = build_voice_docent_question_prompt(request)

        logger.info(
            "Requesting voice docent question answer. artwork_id=%s has_question=%s",
            request.artwork_id,
            bool(request.user_question),
        )

        try:
            message = await self._get_external_ai_client().generate_text(prompt)
        except ExternalAiClientError as exc:
            raise _map_ai_error(exc) from exc
        except AiApiError:
            raise

        return VoiceDocentQuestionResponse(message=ground_ai_response(message, request))

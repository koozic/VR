from app.clients.external_ai_client import ExternalAiClient
from app.core.prompt_templates import build_artwork_explanation_prompt
from app.schemas.ai_request import AiExplainRequest
from app.schemas.ai_response import AiExplainResponse


class AiService:
    def __init__(self) -> None:
        self.external_ai_client = ExternalAiClient()

    def explain_artwork(self, request: AiExplainRequest) -> AiExplainResponse:
        prompt = build_artwork_explanation_prompt(request)
        message = self.external_ai_client.generate_text(prompt)
        return AiExplainResponse(message=message)


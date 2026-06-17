from app.core.prompt_templates import build_artwork_explanation_prompt
from app.schemas.voice_docent_question_request import VoiceDocentQuestionRequest


def build_voice_docent_question_prompt(request: VoiceDocentQuestionRequest) -> str:
    return (
        "The visitor question below was captured from the user's voice and "
        "converted to text by the browser. Treat it as an ordinary visitor "
        "question, and do not mention speech recognition unless it is relevant.\n\n"
        f"{build_artwork_explanation_prompt(request)}"
    )

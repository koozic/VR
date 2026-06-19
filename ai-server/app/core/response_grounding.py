import re

from app.schemas.ai_request import AiExplainRequest


_CREATOR_CLAIM_PATTERNS = (
    re.compile(r"(?:작가|제작자)(?:는|은|:)[^.!?\n]{1,80}(?:입니다|이다)"),
    re.compile(
        r"(?:의 작품(?:입니다|이다)|(?:가|이) 제작(?:한 작품(?:입니다|이다)|했습니다|했다))"
    ),
)


def create_grounded_fallback(request: AiExplainRequest) -> str:
    title = request.title or "이 전시물"
    description = request.description or "현재 확인할 수 있는 저장 설명문이 없습니다."
    creator = f" 작가·제작자는 {request.artist_name}입니다." if request.artist_name else ""
    return f"{title}에 대해 확인된 내용부터 말씀드릴게요. {description}{creator}"


def ground_ai_response(message: str, request: AiExplainRequest) -> str:
    expected_creator = (request.artist_name or "").strip().casefold()
    normalized_message = message.casefold()
    claims_creator = any(pattern.search(message) for pattern in _CREATOR_CLAIM_PATTERNS)

    if claims_creator and expected_creator and expected_creator not in normalized_message:
        return create_grounded_fallback(request)
    return message

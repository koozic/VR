import re

from app.schemas.ai_request import AiExplainRequest


_CREATOR_CLAIM_PATTERNS = (
    re.compile(r"(?:작가|제작자)(?:는|은|:)[^.!?\n]{1,80}(?:입니다|이다)"),
    re.compile(
        r"(?:의 작품(?:입니다|이다)|(?:가|이) 제작(?:한 작품(?:입니다|이다)|했습니다|했다))"
    ),
)
_YEAR_PATTERN = re.compile(r"(?:1[0-9]{3}|20[0-9]{2})년?")
_LATIN_WORD_PATTERN = re.compile(r"[A-Za-z][A-Za-z0-9.-]*")
_MEMORIAL_PURPOSE_PATTERN = re.compile(
    r"(?:전몰|희생|전사|세계대전|전쟁|기념비)[^.!?\n]{0,40}"
    r"[가-힣]{2,}기\s*위해"
)
_MEMORIAL_TERMS = ("추모", "기리", "애도", "기억", "위로")
_SUSPICIOUS_HANGUL_PATTERNS = (
    re.compile(r"묵시우[가-힣]*"),
)
_COMMON_LATIN_WORDS = {"ai", "vr"}
_GENERAL_KNOWLEDGE_QUESTION_TERMS = (
    "다른 대표작",
    "대표작",
    "다른 작품",
    "또 어떤 작품",
    "또다른 작품",
    "유명한 작품",
    "작가의 작품",
    "작가 작품",
    "시대 배경",
    "미술사",
)


def create_grounded_fallback(request: AiExplainRequest) -> str:
    title = request.title or "이 전시물"
    description = request.description or "현재 확인할 수 있는 저장 설명문이 없습니다."
    creator = f" 작가·제작자는 {request.artist_name}입니다." if request.artist_name else ""
    return f"{title}에 대해 확인된 내용부터 말씀드릴게요. {description}{creator}"


def _trusted_context(request: AiExplainRequest) -> str:
    values = [
        request.title,
        request.artist_name,
        request.description,
        *(request.keywords or []),
        request.example_text,
        request.docent_context,
    ]
    return " ".join(value for value in values if value)


def _allows_general_knowledge(request: AiExplainRequest) -> bool:
    question = request.user_question or ""
    return any(term in question for term in _GENERAL_KNOWLEDGE_QUESTION_TERMS)


def _has_unsupported_year(message: str, trusted_context: str) -> bool:
    trusted_years = set(_YEAR_PATTERN.findall(trusted_context))
    message_years = _YEAR_PATTERN.findall(message)
    if not message_years:
        return False
    if not trusted_years:
        return True
    return any(year not in trusted_years for year in message_years)


def _has_unsupported_latin_word(message: str, trusted_context: str) -> bool:
    trusted_words = {
        word.casefold() for word in _LATIN_WORD_PATTERN.findall(trusted_context)
    }
    return any(
        word.casefold() not in trusted_words and word.casefold() not in _COMMON_LATIN_WORDS
        for word in _LATIN_WORD_PATTERN.findall(message)
    )


def _has_broken_memorial_purpose(message: str, request: AiExplainRequest) -> bool:
    if any(pattern.search(message) for pattern in _SUSPICIOUS_HANGUL_PATTERNS):
        return True
    description = request.description or ""
    if "추모" not in description:
        return False
    if not _MEMORIAL_PURPOSE_PATTERN.search(message):
        return False
    return not any(term in message for term in _MEMORIAL_TERMS)


def ground_ai_response(message: str, request: AiExplainRequest) -> str:
    trusted_context = _trusted_context(request)
    allows_general_knowledge = _allows_general_knowledge(request)
    expected_creator = (request.artist_name or "").strip().casefold()
    normalized_message = message.casefold()
    claims_creator = any(pattern.search(message) for pattern in _CREATOR_CLAIM_PATTERNS)

    if claims_creator and expected_creator and expected_creator not in normalized_message:
        return create_grounded_fallback(request)
    if not allows_general_knowledge and _has_unsupported_year(message, trusted_context):
        return create_grounded_fallback(request)
    if not allows_general_knowledge and _has_unsupported_latin_word(message, trusted_context):
        return create_grounded_fallback(request)
    if _has_broken_memorial_purpose(message, request):
        return create_grounded_fallback(request)
    return message

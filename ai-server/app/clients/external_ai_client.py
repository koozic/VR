import logging
import os
import threading
import time
from typing import Any

from dotenv import load_dotenv
from google.genai import Client, errors, types

load_dotenv()

logger = logging.getLogger(__name__)


class ExternalAiClientError(RuntimeError):
    """외부 AI 요청을 완료하지 못했을 때 사용하는 최상위 예외."""


class ExternalAiClientConfigurationError(ExternalAiClientError):
    """API 키나 숫자 설정이 없거나 잘못됐을 때 발생하는 예외."""


class ExternalAiClientGenerationError(ExternalAiClientError):
    """Gemini가 정상적인 텍스트를 생성하지 못했을 때 발생하는 예외."""


def _get_timeout_ms() -> int:
    raw_timeout = os.getenv("EXTERNAL_AI_TIMEOUT_MS", "30000").strip()
    try:
        timeout_ms = int(raw_timeout)
    except ValueError as exc:
        raise ExternalAiClientConfigurationError(
            "EXTERNAL_AI_TIMEOUT_MS must be an integer number of milliseconds."
        ) from exc

    if timeout_ms <= 0:
        raise ExternalAiClientConfigurationError(
            "EXTERNAL_AI_TIMEOUT_MS must be greater than 0."
        )
    return timeout_ms


def _get_max_output_tokens() -> int:
    raw_value = os.getenv("EXTERNAL_AI_MAX_OUTPUT_TOKENS", "512").strip()
    try:
        max_output_tokens = int(raw_value)
    except ValueError as exc:
        raise ExternalAiClientConfigurationError(
            "EXTERNAL_AI_MAX_OUTPUT_TOKENS must be an integer."
        ) from exc

    if max_output_tokens <= 0:
        raise ExternalAiClientConfigurationError(
            "EXTERNAL_AI_MAX_OUTPUT_TOKENS must be greater than 0."
        )
    return max_output_tokens


def _get_positive_int(name: str, default: int) -> int:
    raw_value = os.getenv(name, str(default)).strip()
    try:
        value = int(raw_value)
    except ValueError as exc:
        raise ExternalAiClientConfigurationError(f"{name} must be an integer.") from exc
    if value <= 0:
        raise ExternalAiClientConfigurationError(f"{name} must be greater than 0.")
    return value


def _get_api_keys() -> list[str]:
    """쉼표로 구분된 여러 키를 읽고, 없으면 단일 키 설정을 대신 사용한다."""
    keys = [
        key.strip()
        for key in os.getenv("GEMINI_API_KEYS", "").split(",")
        if key.strip()
    ]
    if not keys:
        single_key = os.getenv("GEMINI_API_KEY", "").strip()
        if single_key:
            keys.append(single_key)
    return list(dict.fromkeys(keys))


def _is_key_specific_error(exc: errors.APIError) -> bool:
    """다른 API 키로 재시도할 수 있는 인증·권한·할당량 오류인지 판단한다."""
    return exc.code in {401, 403, 429} or exc.status == "RESOURCE_EXHAUSTED"


class ExternalAiClient:
    """Gemini 호출과 API 키 순환, 일시 사용 중지(cooldown)를 관리한다."""

    def __init__(self) -> None:
        self.api_keys = _get_api_keys()
        self.model = os.getenv("EXTERNAL_AI_MODEL", "gemini-2.5-flash").strip()
        self.timeout_ms = _get_timeout_ms()
        self.max_output_tokens = _get_max_output_tokens()
        self.max_key_attempts = _get_positive_int("EXTERNAL_AI_MAX_KEY_ATTEMPTS", 2)
        self.key_cooldown_seconds = _get_positive_int("EXTERNAL_AI_KEY_COOLDOWN_SECONDS", 300)
        self._next_key_index = 0
        self._cooldown_until = [0.0] * len(self.api_keys)
        self._key_lock = threading.Lock()

        if not self.api_keys:
            raise ExternalAiClientConfigurationError(
                "GEMINI_API_KEYS or GEMINI_API_KEY is not configured."
            )
        if not self.model:
            raise ExternalAiClientConfigurationError("EXTERNAL_AI_MODEL is not configured.")

        # 키마다 독립적인 Gemini Client를 생성해 특정 키가 막히면 다음 키로 전환한다.
        self.clients = [
            Client(
                api_key=api_key,
                http_options=types.HttpOptions(timeout=self.timeout_ms),
            )
            for api_key in self.api_keys
        ]

    async def generate_text(self, prompt: str) -> str:
        return await self.generate_content(prompt)

    async def generate_content(self, contents: Any) -> str:
        """사용 가능한 API 키를 순서대로 선택해 Gemini 응답을 생성한다."""
        attempted_indices: set[int] = set()
        attempt_limit = min(self.max_key_attempts, len(self.clients))

        for attempt in range(attempt_limit):
            key_index = self._select_key_index(attempted_indices)
            if key_index is None:
                break
            attempted_indices.add(key_index)

            try:
                response = await self.clients[key_index].aio.models.generate_content(
                    model=self.model,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        max_output_tokens=self.max_output_tokens,
                        temperature=0.5,
                        thinking_config=types.ThinkingConfig(thinking_budget=0),
                    ),
                )
            except errors.APIError as exc:
                if _is_key_specific_error(exc):
                    # 해당 키만의 인증/할당량 문제라면 일정 시간 제외하고 다음 키로 재시도한다.
                    self._cool_down_key(key_index)
                    logger.warning(
                        "Gemini key slot %s is unavailable; cooling it down. status=%s code=%s",
                        key_index + 1,
                        exc.status,
                        exc.code,
                    )
                    continue
                logger.warning("External AI provider returned an API error.", exc_info=True)
                raise ExternalAiClientGenerationError("External AI provider request failed.") from exc
            except Exception as exc:
                logger.exception("Unexpected external AI client error.")
                raise ExternalAiClientGenerationError("External AI provider request failed.") from exc

            text = (response.text or "").strip()
            if not text:
                logger.warning("External AI provider returned an empty response.")
                raise ExternalAiClientGenerationError("External AI provider returned an empty response.")
            return text

        raise ExternalAiClientGenerationError("No Gemini API key is currently available.")

    def _select_key_index(self, excluded: set[int]) -> int | None:
        """이번 요청에서 아직 시도하지 않았고 cooldown 중이 아닌 키를 선택한다."""
        now = time.monotonic()
        with self._key_lock:
            # 여러 요청이 동시에 들어와도 키 선택 인덱스가 꼬이지 않도록 Lock으로 보호한다.
            for offset in range(len(self.clients)):
                index = (self._next_key_index + offset) % len(self.clients)
                if index in excluded or self._cooldown_until[index] > now:
                    continue
                self._next_key_index = (index + 1) % len(self.clients)
                return index
        return None

    def _cool_down_key(self, key_index: int) -> None:
        """문제가 생긴 키를 설정된 시간 동안 선택 대상에서 제외한다."""
        with self._key_lock:
            self._cooldown_until[key_index] = time.monotonic() + self.key_cooldown_seconds

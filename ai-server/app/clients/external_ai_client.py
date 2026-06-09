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
    """Base error raised when the external AI client cannot complete a request."""


class ExternalAiClientConfigurationError(ExternalAiClientError):
    """Raised when required external AI configuration is missing or invalid."""


class ExternalAiClientGenerationError(ExternalAiClientError):
    """Raised when the external AI provider fails to generate usable content."""


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
    return exc.code in {401, 403, 429} or exc.status == "RESOURCE_EXHAUSTED"


class ExternalAiClient:
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
        now = time.monotonic()
        with self._key_lock:
            for offset in range(len(self.clients)):
                index = (self._next_key_index + offset) % len(self.clients)
                if index in excluded or self._cooldown_until[index] > now:
                    continue
                self._next_key_index = (index + 1) % len(self.clients)
                return index
        return None

    def _cool_down_key(self, key_index: int) -> None:
        with self._key_lock:
            self._cooldown_until[key_index] = time.monotonic() + self.key_cooldown_seconds

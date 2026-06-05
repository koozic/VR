import logging
import os
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


class ExternalAiClient:
    def __init__(self) -> None:
        self.api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.model = os.getenv("EXTERNAL_AI_MODEL", "gemini-2.5-flash").strip()
        self.timeout_ms = _get_timeout_ms()

        if not self.api_key:
            raise ExternalAiClientConfigurationError("GEMINI_API_KEY is not configured.")
        if not self.model:
            raise ExternalAiClientConfigurationError("EXTERNAL_AI_MODEL is not configured.")

        self.client = Client(
            api_key=self.api_key,
            http_options=types.HttpOptions(timeout=self.timeout_ms),
        )

    async def generate_text(self, prompt: str) -> str:
        return await self.generate_content(prompt)

    async def generate_content(self, contents: Any) -> str:
        try:
            response = await self.client.aio.models.generate_content(
                model=self.model,
                contents=contents,
            )
        except errors.APIError as exc:
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

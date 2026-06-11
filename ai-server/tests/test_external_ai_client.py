import os
import unittest
from types import SimpleNamespace
from unittest.mock import patch

from google.genai import errors

from app.clients.external_ai_client import (
    ExternalAiClient,
    ExternalAiClientGenerationError,
    ExternalAiClientQuotaError,
)


class FakeModels:
    def __init__(self, outcomes):
        self.outcomes = outcomes
        self.calls = 0

    async def generate_content(self, **_kwargs):
        self.calls += 1
        outcome = self.outcomes.pop(0)
        if isinstance(outcome, Exception):
            raise outcome
        return SimpleNamespace(text=outcome)


class FakeClient:
    outcomes_by_key = {}
    instances = []

    def __init__(self, api_key, http_options):
        del http_options
        models = FakeModels(list(self.outcomes_by_key[api_key]))
        self.aio = SimpleNamespace(models=models)
        self.instances.append(self)


class ExternalAiClientTest(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        FakeClient.instances = []

    async def test_round_robins_one_key_per_successful_request(self):
        FakeClient.outcomes_by_key = {"key-a": ["a"], "key-b": ["b"]}
        with patch.dict(
            os.environ,
            {
                "GEMINI_API_KEYS": "key-a,key-b",
                "EXTERNAL_AI_MAX_KEY_ATTEMPTS": "2",
            },
            clear=True,
        ), patch("app.clients.external_ai_client.Client", FakeClient):
            client = ExternalAiClient()
            self.assertEqual(await client.generate_text("prompt"), "a")
            self.assertEqual(await client.generate_text("prompt"), "b")

        self.assertEqual([item.aio.models.calls for item in FakeClient.instances], [1, 1])

    async def test_quota_error_uses_one_other_key_and_cools_down_failed_key(self):
        quota_error = errors.ClientError(
            429,
            {"error": {"code": 429, "status": "RESOURCE_EXHAUSTED", "message": "quota"}},
        )
        FakeClient.outcomes_by_key = {"key-a": [quota_error], "key-b": ["ok", "next"]}
        with patch.dict(
            os.environ,
            {
                "GEMINI_API_KEYS": "key-a,key-b",
                "EXTERNAL_AI_MAX_KEY_ATTEMPTS": "2",
                "EXTERNAL_AI_KEY_COOLDOWN_SECONDS": "300",
            },
            clear=True,
        ), patch("app.clients.external_ai_client.Client", FakeClient):
            client = ExternalAiClient()
            self.assertEqual(await client.generate_text("prompt"), "ok")
            self.assertEqual(await client.generate_text("prompt"), "next")

        self.assertEqual([item.aio.models.calls for item in FakeClient.instances], [1, 2])

    async def test_server_error_does_not_consume_another_key(self):
        server_error = errors.ServerError(
            500,
            {"error": {"code": 500, "status": "INTERNAL", "message": "server"}},
        )
        FakeClient.outcomes_by_key = {"key-a": [server_error], "key-b": ["unused"]}
        with patch.dict(
            os.environ,
            {
                "GEMINI_API_KEYS": "key-a,key-b",
                "EXTERNAL_AI_MAX_KEY_ATTEMPTS": "2",
            },
            clear=True,
        ), patch("app.clients.external_ai_client.Client", FakeClient):
            client = ExternalAiClient()
            with self.assertRaises(ExternalAiClientGenerationError):
                await client.generate_text("prompt")

        self.assertEqual([item.aio.models.calls for item in FakeClient.instances], [1, 0])

    async def test_all_quota_errors_preserve_quota_failure_reason(self):
        quota_error_a = errors.ClientError(
            429,
            {"error": {"code": 429, "status": "RESOURCE_EXHAUSTED", "message": "quota"}},
        )
        quota_error_b = errors.ClientError(
            429,
            {"error": {"code": 429, "status": "RESOURCE_EXHAUSTED", "message": "quota"}},
        )
        FakeClient.outcomes_by_key = {
            "key-a": [quota_error_a],
            "key-b": [quota_error_b],
        }
        with patch.dict(
            os.environ,
            {
                "GEMINI_API_KEYS": "key-a,key-b",
                "EXTERNAL_AI_MAX_KEY_ATTEMPTS": "2",
                "EXTERNAL_AI_KEY_COOLDOWN_SECONDS": "300",
            },
            clear=True,
        ), patch("app.clients.external_ai_client.Client", FakeClient):
            client = ExternalAiClient()

            with self.assertRaises(ExternalAiClientQuotaError):
                await client.generate_text("prompt")
            with self.assertRaises(ExternalAiClientQuotaError):
                await client.generate_text("prompt")

        self.assertEqual([item.aio.models.calls for item in FakeClient.instances], [1, 1])


if __name__ == "__main__":
    unittest.main()

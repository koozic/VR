import asyncio
import json
import os
import re
import sys
from dataclasses import asdict, dataclass

from google.genai import Client, types


PROMPT = """당신은 가상 전시관의 전문 AI 도슨트입니다.
반드시 자연스러운 한국어로 답변하세요.
답변은 3~4문장, 공백 포함 200~350자 안팎으로 작성하세요.
아래 작품 정보와 핵심 키워드만 사실 근거로 사용하세요.
키워드를 목록처럼 나열하지 말고 설명에 자연스럽게 반영하세요.

[작품 정보]
- 제목: 별이 빛나는 밤
- 작가: 빈센트 반 고흐
- 설명: 1889년 작품으로, 요동치는 붓놀림과 강렬한 푸른색, 소용돌이치는 노란 별빛이 특징인 후기 인상주의 작품입니다.

[핵심 키워드]
후기 인상주의, 소용돌이, 노란 별빛

[설명문 참고 예시 - 문체 참고용]
관람객이 장면을 떠올릴 수 있도록 친절하고 쉬운 표현으로 설명합니다.
"""
KEYWORDS = ("후기 인상주의", "소용돌이", "노란 별빛")


@dataclass
class CheckResult:
    key_id: str
    status: str
    characters: int = 0
    sentences: int = 0
    matched_keywords: int = 0
    response: str = ""
    error_type: str = ""


async def check_key(key_id: str, api_key: str) -> CheckResult:
    client = Client(
        api_key=api_key,
        http_options=types.HttpOptions(timeout=20_000),
    )
    try:
        response = await client.aio.models.generate_content(
            model=os.getenv("EXTERNAL_AI_MODEL", "gemini-2.5-flash"),
            contents=PROMPT,
            config=types.GenerateContentConfig(
                max_output_tokens=400,
                temperature=0.3,
                candidate_count=1,
                thinking_config=types.ThinkingConfig(thinking_budget=0),
            ),
        )
        text = (response.text or "").strip()
        return CheckResult(
            key_id=key_id,
            status="ok" if text else "empty",
            characters=len(text),
            sentences=len([part for part in re.split(r"[.!?]+", text) if part.strip()]),
            matched_keywords=sum(keyword in text for keyword in KEYWORDS),
            response=text,
        )
    except Exception as exc:
        return CheckResult(
            key_id=key_id,
            status="error",
            error_type=type(exc).__name__,
        )


async def main() -> int:
    keys = [key.strip() for key in os.getenv("GEMINI_API_KEYS", "").split(",") if key.strip()]
    if not keys:
        print("GEMINI_API_KEYS is required.", file=sys.stderr)
        return 2
    if len(keys) > 3:
        print("Refusing to check more than 3 keys in one run.", file=sys.stderr)
        return 2

    results = []
    for index, key in enumerate(keys, start=1):
        results.append(await check_key(f"key-{index}", key))
        if index < len(keys):
            await asyncio.sleep(2)

    print(json.dumps([asdict(result) for result in results], ensure_ascii=False, indent=2))
    return 0 if all(result.status == "ok" for result in results) else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))

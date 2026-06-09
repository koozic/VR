import argparse
import json
import math
import re
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Check an AI docent explanation response.")
    parser.add_argument("--url", default="http://127.0.0.1:8080/api/ai/explain")
    parser.add_argument("--title", required=True)
    parser.add_argument("--artist-name")
    parser.add_argument("--description", required=True)
    parser.add_argument("--keywords", nargs="*", default=[])
    parser.add_argument("--example-text")
    parser.add_argument("--question")
    parser.add_argument("--min-keyword-coverage", type=float, default=0.5)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    payload = {
        "title": args.title,
        "artistName": args.artist_name,
        "description": args.description,
        "keywords": args.keywords,
        "exampleText": args.example_text,
        "userQuestion": args.question,
    }
    request = Request(
        args.url,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )

    try:
        with urlopen(request, timeout=60) as response:
            body = json.load(response)
    except (HTTPError, URLError, TimeoutError) as exc:
        print(f"REQUEST FAILED: {exc}", file=sys.stderr)
        return 2

    message = body.get("message", "").strip()
    matched = [keyword for keyword in args.keywords if keyword.lower() in message.lower()]
    sentence_count = len([part for part in re.split(r"[.!?]+", message) if part.strip()])

    print(json.dumps(body, ensure_ascii=False, indent=2))
    print("\nCHECK")
    print(f"- generated: {body.get('generated', True)}")
    print(f"- characters: {len(message)}")
    print(f"- sentences: {sentence_count}")
    print(f"- keyword coverage: {len(matched)}/{len(args.keywords)}")
    print(f"- matched keywords: {', '.join(matched) if matched else '(none)'}")

    required_keyword_count = math.ceil(len(args.keywords) * args.min_keyword_coverage)
    checks = {
        "generated response": bool(message) and body.get("generated", True) is not False,
        "length 200-400 characters": 200 <= len(message) <= 400,
        "3-4 sentences": 3 <= sentence_count <= 4,
        "minimum keyword coverage": len(matched) >= required_keyword_count,
    }
    for name, passed in checks.items():
        print(f"- {name}: {'PASS' if passed else 'FAIL'}")

    passed = all(checks.values())
    print(f"\nRESULT: {'PASS' if passed else 'FAIL'}")
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())

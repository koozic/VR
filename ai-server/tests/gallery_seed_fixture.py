import json
from pathlib import Path


def starry_night_exhibit() -> dict:
    seed_path = Path(__file__).parents[2] / "shared" / "gallery-seed.json"
    seed = json.loads(seed_path.read_text(encoding="utf-8"))
    return next(
        exhibit
        for hall in seed["halls"]
        for exhibit in hall["exhibits"]
        if "Starry Night" in exhibit["title"]
    )

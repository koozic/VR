from app.schemas.ai_request import AiExplainRequest


def build_artwork_explanation_prompt(request: AiExplainRequest) -> str:
    artist = request.artist_name or "Unknown artist"
    description = request.description or "No description provided."

    return (
        "You are a museum docent. "
        "Explain the artwork in Korean in a warm, concise style.\n\n"
        f"Title: {request.title}\n"
        f"Artist: {artist}\n"
        f"Description: {description}\n"
    )


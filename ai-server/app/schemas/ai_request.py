from pydantic import BaseModel, Field


class AiExplainRequest(BaseModel):
    artwork_id: int | None = Field(default=None, alias="artworkId")
    title: str
    artist_name: str | None = Field(default=None, alias="artistName")
    description: str | None = None

    model_config = {
        "populate_by_name": True,
    }


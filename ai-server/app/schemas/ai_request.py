from pydantic import BaseModel, Field


class AiExplainRequest(BaseModel):
    artwork_id: int | None = Field(default=None, alias="artworkId", ge=1)
    title: str = Field(min_length=1, max_length=200)
    artist_name: str | None = Field(default=None, alias="artistName", max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    user_question: str | None = Field(default=None, alias="userQuestion", max_length=300)

    model_config = {
        "populate_by_name": True,
    }

from pydantic import BaseModel, Field


class Coordinates(BaseModel):
    x: float = Field(description="Visitor or artwork X coordinate")
    y: float = Field(description="Visitor or artwork Y coordinate")
    z: float = Field(description="Visitor or artwork Z coordinate")


class AiExplainRequest(BaseModel):
    artwork_id: int | None = Field(default=None, alias="artworkId", ge=1)
    title: str | None = Field(default=None, min_length=1, max_length=200)
    artist_name: str | None = Field(default=None, alias="artistName", max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    keywords: list[str] = Field(default_factory=list, max_length=10)
    example_text: str | None = Field(default=None, alias="exampleText", max_length=1000)
    user_question: str | None = Field(default=None, alias="userQuestion", max_length=300)
    user_position: Coordinates | None = Field(default=None, alias="userPosition")
    user_x: float | None = Field(default=None, alias="userX")
    user_y: float | None = Field(default=None, alias="userY")
    user_z: float | None = Field(default=None, alias="userZ")
    hall_id: int | None = Field(default=None, alias="hallId", ge=1)
    max_distance: float | None = Field(default=None, alias="maxDistance", gt=0)

    model_config = {
        "populate_by_name": True,
    }

    def resolved_user_position(self) -> Coordinates | None:
        if self.user_position is not None:
            return self.user_position
        if self.user_x is None or self.user_y is None or self.user_z is None:
            return None
        return Coordinates(x=self.user_x, y=self.user_y, z=self.user_z)

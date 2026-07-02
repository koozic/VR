from pydantic import BaseModel, Field


class Coordinates(BaseModel):
    """가상 전시관 안의 3차원 위치를 표현한다."""

    x: float = Field(description="Visitor or artwork X coordinate")
    y: float = Field(description="Visitor or artwork Y coordinate")
    z: float = Field(description="Visitor or artwork Z coordinate")


class AiExplainRequest(BaseModel):
    """Spring Boot 또는 클라이언트가 보내는 AI 도슨트 요청 형식."""

    # 작품 정보는 백엔드가 미리 채워 보낼 수도 있고, 아래 좌표를 이용해
    # AI 서버가 DB에서 직접 찾아야 할 수도 있으므로 대부분 선택값이다.
    artwork_id: int | None = Field(default=None, alias="artworkId", ge=1)
    title: str | None = Field(default=None, min_length=1, max_length=200)
    artist_name: str | None = Field(default=None, alias="artistName", max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    keywords: list[str] = Field(default_factory=list, max_length=10)
    example_text: str | None = Field(default=None, alias="exampleText", max_length=1000)
    docent_context: str | None = Field(default=None, alias="docentContext", max_length=12000)
    user_question: str | None = Field(default=None, alias="userQuestion", max_length=300)
    user_position: Coordinates | None = Field(default=None, alias="userPosition")
    user_x: float | None = Field(default=None, alias="userX")
    user_y: float | None = Field(default=None, alias="userY")
    user_z: float | None = Field(default=None, alias="userZ")
    hall_id: int | None = Field(default=None, alias="hallId", ge=1)
    max_distance: float | None = Field(default=None, alias="maxDistance", gt=0)

    model_config = {
        # JSON 별칭(artworkId)과 파이썬 필드명(artwork_id)을 모두 허용한다.
        "populate_by_name": True,
    }

    def resolved_user_position(self) -> Coordinates | None:
        """중첩 좌표와 개별 userX/userY/userZ 형식을 하나의 Coordinates로 통일한다."""
        if self.user_position is not None:
            return self.user_position
        if self.user_x is None or self.user_y is None or self.user_z is None:
            return None
        return Coordinates(x=self.user_x, y=self.user_y, z=self.user_z)

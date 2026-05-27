from pydantic import BaseModel


class AiExplainResponse(BaseModel):
    message: str


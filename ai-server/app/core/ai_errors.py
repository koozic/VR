from app.schemas.ai_error import AiErrorCode


class AiApiError(RuntimeError):
    """외부에 공개할 HTTP 상태, 오류 코드, 메시지를 함께 운반한다."""

    def __init__(
        self,
        *,
        status_code: int,
        code: AiErrorCode,
        message: str,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message

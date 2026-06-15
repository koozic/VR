import logging
import os
import time
import uuid
from contextvars import ContextVar

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.clients.external_ai_client import gemini_metrics_snapshot
from app.core.ai_errors import AiApiError
from app.routers.ai_router import router as ai_router
from app.schemas.ai_error import AiErrorCode, AiErrorResponse

load_dotenv()

_log_record_factory = logging.getLogRecordFactory()
request_id_context: ContextVar[str] = ContextVar("request_id", default="-")


def _request_id_record_factory(*args, **kwargs):
    record = _log_record_factory(*args, **kwargs)
    record.request_id = request_id_context.get()
    return record


logging.setLogRecordFactory(_request_id_record_factory)
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(levelname)s %(name)s request_id=%(request_id)s %(message)s",
)
logging.getLogger("uvicorn.access").disabled = True
logger = logging.getLogger(__name__)
STARTED_AT = time.time()

app = FastAPI(title="AI Exhibition AI Server")


def _error_response(
    *,
    status_code: int,
    code: AiErrorCode,
    message: str,
    request_id: str | None = None,
) -> JSONResponse:
    response = AiErrorResponse(code=code, message=message)
    headers = {"X-Request-ID": request_id} if request_id else None
    return JSONResponse(
        status_code=status_code,
        content=response.model_dump(mode="json"),
        headers=headers,
    )


@app.middleware("http")
async def add_request_logging(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = request_id
    token = request_id_context.set(request_id)
    started_at = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        duration_ms = (time.perf_counter() - started_at) * 1000
        logger.exception(
            "Unhandled request failure method=%s path=%s duration_ms=%.2f",
            request.method,
            request.url.path,
            duration_ms,
        )
        request_id_context.reset(token)
        raise

    duration_ms = (time.perf_counter() - started_at) * 1000
    response.headers["X-Request-ID"] = request_id
    logger.info(
        "Request completed method=%s path=%s status=%s duration_ms=%.2f",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    request_id_context.reset(token)
    return response


@app.exception_handler(AiApiError)
async def handle_ai_api_error(request: Request, exc: AiApiError) -> JSONResponse:
    return _error_response(
        status_code=exc.status_code,
        code=exc.code,
        message=exc.message,
        request_id=getattr(request.state, "request_id", None),
    )


@app.exception_handler(HTTPException)
async def handle_http_error(request: Request, exc: HTTPException) -> JSONResponse:
    code = AiErrorCode.INVALID_REQUEST
    if exc.status_code == 413:
        code = AiErrorCode.PAYLOAD_TOO_LARGE
    elif exc.status_code == 415:
        code = AiErrorCode.UNSUPPORTED_MEDIA_TYPE
    return _error_response(
        status_code=exc.status_code,
        code=code,
        message=str(exc.detail or "요청을 처리할 수 없습니다."),
        request_id=getattr(request.state, "request_id", None),
    )


@app.exception_handler(RequestValidationError)
async def handle_validation_error(request: Request, _exc: RequestValidationError) -> JSONResponse:
    return _error_response(
        status_code=400,
        code=AiErrorCode.INVALID_REQUEST,
        message="요청 형식이 올바르지 않습니다.",
        request_id=getattr(request.state, "request_id", None),
    )


@app.exception_handler(Exception)
async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
    logger.exception(
        "Unexpected server error",
        exc_info=exc,
    )
    return _error_response(
        status_code=500,
        code=AiErrorCode.INTERNAL_SERVER_ERROR,
        message="AI 서버 내부 오류가 발생했습니다.",
        request_id=getattr(request.state, "request_id", None),
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://localhost:5173",
        "http://127.0.0.1:5173",
        "https://127.0.0.1:5173",
        "http://localhost:8080",
    ],
    allow_origin_regex=r"https?://(10|192\.168|172\.(1[6-9]|2[0-9]|3[0-1]))\.[^/:]+:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_router, prefix="/ai", tags=["ai"])


@app.get("/health")
def health_check() -> dict[str, object]:
    gemini_keys_configured = bool(
        os.getenv("GEMINI_API_KEYS", "").strip() or os.getenv("GEMINI_API_KEY", "").strip()
    )
    return {
        "status": "ok",
        "uptimeSeconds": round(time.time() - STARTED_AT, 2),
        "dependencies": {
            "gemini": {
                "configured": gemini_keys_configured,
                "metrics": gemini_metrics_snapshot(),
            },
            "database": {
                "status": "not_applicable",
                "message": "Artwork lookup and DB health are owned by Spring Boot.",
            },
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=int(os.getenv("AI_SERVER_PORT", "8010")))

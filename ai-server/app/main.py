import os

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.ai_errors import AiApiError
from app.routers.ai_router import router as ai_router
from app.schemas.ai_error import AiErrorResponse

load_dotenv()

# FastAPI 애플리케이션을 만들고 Swagger 문서의 서비스 이름을 지정한다.
app = FastAPI(title="AI Exhibition AI Server")


@app.exception_handler(AiApiError)
async def handle_ai_api_error(_request: Request, exc: AiApiError) -> JSONResponse:
    """AI 계층의 실패를 Spring Boot가 해석할 수 있는 고정 JSON으로 반환한다."""
    response = AiErrorResponse(code=exc.code, message=exc.message)
    return JSONResponse(
        status_code=exc.status_code,
        content=response.model_dump(mode="json"),
    )

# 브라우저와 Spring Boot 백엔드가 다른 포트에서 이 서버를 호출할 수 있도록
# 개발 환경에서 사용하는 주소와 사설망 주소의 CORS 요청을 허용한다.
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

# ai_router에 정의된 /explain 경로 앞에 공통 접두사 /ai를 붙인다.
app.include_router(ai_router, prefix="/ai", tags=["ai"])


@app.get("/health")
def health_check() -> dict[str, str]:
    """프로세스가 정상적으로 실행 중인지 확인하는 간단한 상태 점검 API."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    # python -m app.main으로 직접 실행할 때 Uvicorn 웹 서버를 시작한다.
    uvicorn.run("app.main:app", host="0.0.0.0", port=int(os.getenv("AI_SERVER_PORT", "8010")))

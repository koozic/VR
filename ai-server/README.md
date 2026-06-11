# AI Docent FastAPI Server

Spring Boot 백엔드가 호출하는 Python FastAPI 기반 AI 도슨트 서버입니다.

## 담당 API

```text
POST /ai/explain
POST /ai/explain/audio
GET  /health
```

현재 프로젝트의 핵심 연결 API는 텍스트 기반 설명을 생성하는 `POST /ai/explain`입니다.

## 요청 흐름

```text
Frontend
  -> Spring Boot POST /api/ai/explain
  -> FastAPI POST /ai/explain
  -> Gemini AI
  -> FastAPI
  -> Spring Boot
  -> Frontend
```

## 실행 준비

권장 Python 버전은 `3.11` 또는 `3.12`입니다. 현재 의존성의 일부 패키지는 Python `3.14`에서 사전 빌드 wheel을 제공하지 않아 Visual C++ Build Tools 없이 설치가 실패할 수 있습니다.

```powershell
cd C:\es\VR\ai-server
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

`.env` 파일에 Gemini API 키를 입력합니다.

```env
GEMINI_API_KEY=발급받은_Gemini_API_키
```

## 서버 실행

```powershell
python -m app.main
```

기본 포트는 `.env.example` 기준 `8010`입니다.

```text
Health Check: http://localhost:8010/health
Swagger Docs: http://localhost:8010/docs
```

## 단독 테스트 예시

```powershell
curl -X POST "http://localhost:8010/ai/explain" `
  -H "Content-Type: application/json" `
  -d "{\"artworkId\":1,\"title\":\"별이 빛나는 밤\",\"artistName\":\"빈센트 반 고흐\",\"description\":\"소용돌이치는 밤하늘과 마을을 표현한 작품입니다.\",\"userQuestion\":\"이 작품의 하늘은 왜 소용돌이치나요?\"}"
```

정상 응답 형식은 다음과 같습니다.

```json
{
  "message": "AI 도슨트 답변"
}
```

AI 생성 실패 응답은 HTTP 상태가 달라도 항상 같은 JSON 구조를 사용합니다.

```json
{
  "code": "GEMINI_QUOTA_EXHAUSTED",
  "message": "Gemini 무료 할당량을 모두 사용했습니다."
}
```

| HTTP 상태 | `code` | 의미 |
| --- | --- | --- |
| `429` | `GEMINI_QUOTA_EXHAUSTED` | Gemini API 할당량 소진 |
| `503` | `GEMINI_AUTH_FAILED` | Gemini API 키 인증 또는 권한 실패 |
| `503` | `AI_SERVER_CONFIGURATION_ERROR` | AI 서버 환경 설정 오류 |
| `502` | `AI_GENERATION_FAILED` | 그 밖의 외부 AI 생성 실패 |

Spring Boot는 사용자용 `message`가 아니라 고정된 `code`를 기준으로 분기해야 합니다.

## Spring Boot와 함께 테스트

1. FastAPI 서버를 먼저 실행합니다.
2. Spring Boot 백엔드를 실행합니다.
3. Spring Boot의 `POST /api/ai/explain`을 호출합니다.
4. Spring Boot가 FastAPI의 `POST /ai/explain`을 호출하고 `message` 응답을 반환하는지 확인합니다.

Spring Boot 기본 FastAPI 주소는 `http://localhost:8010`입니다. 다른 포트를 사용할 때는 `AI_SERVER_PORT`와 `AI_SERVER_BASE_URL`을 함께 바꿔야 합니다.

## 주요 파일

- `app/main.py`: FastAPI 앱 생성, `/ai` 라우터 등록, `/health` 제공
- `app/routers/ai_router.py`: `/ai/explain`, `/ai/explain/audio` 엔드포인트
- `app/schemas/ai_request.py`: Spring Boot가 보내는 요청 데이터 구조
- `app/schemas/ai_response.py`: `message` 응답 구조
- `app/schemas/ai_error.py`: Spring Boot가 분기할 수 있는 오류 코드와 응답 구조
- `app/services/ai_service.py`: 작품 정보 보정, 프롬프트 생성, Gemini 호출
- `app/core/ai_errors.py`: HTTP 상태와 공개 오류 정보를 운반하는 예외
- `app/core/prompt_templates.py`: 텍스트 설명 프롬프트 템플릿
- `app/clients/external_ai_client.py`: Gemini API 호출
- `app/repositories/artwork_repository.py`: DB 기반 작품 조회 및 좌표 기반 가까운 작품 탐색

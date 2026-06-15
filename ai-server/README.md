# AI Docent FastAPI Server

Spring Boot가 조회한 작품 정보를 받아 Gemini로 도슨트 답변을 생성하는 FastAPI 서버입니다.

## 역할 분리

AI 서버는 DB 조회 서버가 아닙니다. 사용자 좌표 기반 가까운 작품 조회, 작품 ID 조회, DB 연결 상태 확인은 Spring Boot가 담당합니다.

FastAPI는 Spring이 전달한 `title`, `artistName`, `description`, `keywords`, `exampleText`, `userQuestion`을 바탕으로 AI 답변만 생성합니다. 좌표나 작품 ID만 전달되고 작품 정보가 없으면 `ARTWORK_CONTEXT_REQUIRED` 오류를 반환합니다.

## 실행 준비

권장 Python 버전은 3.11 또는 3.12입니다.

```powershell
cd C:\es\VR\ai-server
python -m venv .venv
.\.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
copy .env.example .env
```

`.env` 파일에 Gemini API 키를 입력합니다.

```env
GEMINI_API_KEY=your_gemini_api_key
```

## 서버 실행

```powershell
python -m app.main
```

기본 주소는 다음과 같습니다.

```text
Health Check: http://localhost:8010/health
Swagger Docs: http://localhost:8010/docs
```

## 테스트 실행

```powershell
cd C:\es\VR\ai-server
.\.venv\Scripts\activate
python -m unittest discover -s tests
```

## API

```text
POST /ai/explain
POST /ai/explain/audio
GET  /health
```

`POST /ai/explain` 예시:

```powershell
curl -X POST "http://localhost:8010/ai/explain" `
  -H "Content-Type: application/json" `
  -d "{\"artworkId\":1,\"title\":\"Starry Night\",\"artistName\":\"Vincent van Gogh\",\"description\":\"A swirling night sky over a quiet village.\",\"userQuestion\":\"Why does the sky look like it is moving?\"}"
```

정상 응답:

```json
{
  "message": "AI docent response"
}
```

오류 응답은 항상 같은 형태입니다.

```json
{
  "code": "ARTWORK_CONTEXT_REQUIRED",
  "message": "AI 서버는 작품을 직접 조회하지 않습니다. Spring에서 가까운 작품을 조회한 뒤 title, artistName, description을 전달해주세요."
}
```

Spring Boot는 사용자에게 보여줄 문구보다 `code`를 기준으로 분기하는 것을 권장합니다.

## 운영 확인

모든 응답에는 `X-Request-ID` 헤더가 포함됩니다. 클라이언트가 `X-Request-ID`를 보내면 같은 값을 유지하고, 없으면 서버가 새 UUID를 발급합니다.

서버 로그에는 요청 ID, HTTP 메서드, 경로, 상태 코드, 응답 시간이 남습니다.

`GET /health`는 프로세스 상태, Gemini 설정 여부, Gemini 요청 실패율, DB 역할 상태를 반환합니다. DB는 Spring Boot 담당이므로 FastAPI 헬스에서는 `not_applicable`로 표시합니다.

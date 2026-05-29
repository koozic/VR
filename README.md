# AI Exhibition

React + Three.js frontend, Spring Boot backend, and Python FastAPI AI server for an interactive virtual exhibition.

## Project Structure

```text
frontend/   React + Three.js client
backend/    Spring Boot API server
ai-server/  FastAPI AI service
docs/       Project documents
```

## Local Run

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

Requires JDK 25 LTS.

```bash
cd backend
mvn spring-boot:run
```

### AI Server

```bash
cd ai-server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

## Git Ignore Policy

Generated build outputs, dependency folders, local IDE files, caches, logs, and private `.env` files are ignored. Example environment files such as `.env.example` are kept in Git.


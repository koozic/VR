# AI Exhibition

React + Three.js frontend, Spring Boot backend, and Python FastAPI AI server for an interactive virtual exhibition.

## Project Structure

```text
frontend/   React + Three.js client
backend/    Spring Boot API server
ai-server/  FastAPI AI service
docs/       Project documents
shared/     Shared gallery seed used by frontend and backend
```

## Gallery Seed

Edit `shared/gallery-seed.json` when changing halls, exhibits, portals, games,
or gallery videos. Increment its top-level `version` whenever the backend
database must be reseeded with those changes.

## Local Run

### Recommended: verified full stack

On Windows, use the project launcher so older project processes cannot keep
serving stale code:

```powershell
.\scripts\dev.cmd restart
.\scripts\dev.cmd status
```

The launcher only stops processes verified as belonging to this repository,
starts all three servers from the current working tree, and verifies that the
backend `/api/health` commit and branch match the current Git checkout.

To use microphone-based voice chat from another PC on the same local network,
the frontend must use a trusted HTTPS certificate. See
[`docs/local-network-voice-chat.md`](docs/local-network-voice-chat.md).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

Requires JDK 17.

```bash
cd backend
mvn spring-boot:run -D spring-boot.run.profiles=local
```

The `local` profile uses an in-memory H2 database and seed data. To connect to
the shared Oracle database instead, omit the profile and provide `DB_URL`,
`DB_USERNAME`, and `DB_PASSWORD`.

### AI Server

```bash
cd ai-server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python -m app.main
```

The local AI server listens on port `8010` by default. The local Spring profile
uses the same port. Override `AI_SERVER_PORT` and `AI_SERVER_BASE_URL` together
when another port is needed.

## Git Ignore Policy

Generated build outputs, dependency folders, local IDE files, caches, logs, and private `.env` files are ignored. Example environment files such as `.env.example` are kept in Git.


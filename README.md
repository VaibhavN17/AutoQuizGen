# AutoQuizGen

AutoQuizGen is a full-stack application that generates multiple-choice quizzes from uploaded documents (PDF, DOCX, TXT) using an LLM service.

It includes:
- A React + Vite frontend for upload, generation progress, quiz taking, dashboard, and history.
- A Spring Boot backend with PostgreSQL persistence for quizzes and questions.
- Configurable quiz generation options: number of questions and difficulty.

## Table of Contents
- Features
- Tech Stack
- Project Structure
- Prerequisites
- Quick Start (Windows)
- Configuration
- API Reference
- Data Model
- Runtime Flow
- Troubleshooting
- Available Commands
- Future Improvements

## Features
- Upload document files (`.pdf`, `.docx`, `.txt`).
- Generate quiz questions from extracted text using LLM.
- Choose quiz difficulty (`easy`, `medium`, `hard`).
- Choose number of questions (1 to 50).
- View dashboard and quiz history.
- Persist generated quizzes, questions, and options in PostgreSQL.
- Async background quiz generation in backend.

## Tech Stack

Frontend:
- React 19
- Vite 8
- React Router
- Tailwind CSS v4

Backend:
- Java 21+
- Spring Boot 3.2
- Spring Web
- Spring Data JPA
- PostgreSQL
- Apache PDFBox (PDF parsing)
- Apache POI (DOCX parsing)

AI:
- Local/OpenAI-compatible LLM endpoint configured via `llama.api.url`

## Project Structure

```text
AutoQuize/
  backend/
    src/main/java/com/autoquizgen/backend/
      controllers/
      models/
      repository/
      services/
    src/main/resources/application.properties
    pom.xml
  frontend/
    src/
      components/
      pages/
      lib/
    package.json
  README.md
```

## Prerequisites

Install the following before running:
- Java 21 or newer
- Maven (or use included Maven Wrapper)
- Node.js 18+ and npm
- PostgreSQL 14+
- LLM service endpoint compatible with `chat/completions` API

## Quick Start (Windows)

### 1) Clone and open project

```powershell
git clone <your-repo-url>
cd AutoQuize
```

### 2) Create database

Open PostgreSQL and run:

```sql
CREATE DATABASE autoquizgen;
```

### 3) Configure backend

Edit:
- `backend/src/main/resources/application.properties`

Set at least:

```properties
server.port=8082
spring.datasource.url=jdbc:postgresql://localhost:5432/autoquizgen
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
spring.jpa.hibernate.ddl-auto=update
llama.api.url=http://127.0.0.1:8081/v1/chat/completions
```

### 4) Start backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Backend runs on:
- `http://localhost:8082`

### 5) Start frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs on:
- `http://localhost:5173`

### 6) Use app
- Open `http://localhost:5173`
- Login
- Upload a file
- Set question count and difficulty
- Generate and take quiz

## Configuration

### Frontend API base URL behavior
The frontend builds API URLs using `frontend/src/lib/api.js`:
- In dev (`npm run dev`): uses `/api` and Vite proxy.
- In build/preview: defaults to `http://localhost:8082/api`.

Optional override:

```bash
VITE_API_BASE_URL=http://localhost:8082/api
```

### Vite dev proxy
Configured in `frontend/vite.config.js`:
- `/api/*` -> `http://localhost:8082`

### Backend CORS
Backend allows local frontend origins using:
- `@CrossOrigin(originPatterns = "http://localhost:*")`

### File upload limits
In `application.properties`:
- `spring.servlet.multipart.max-file-size=5MB`
- `spring.servlet.multipart.max-request-size=10MB`

## API Reference

Base URL:
- `http://localhost:8082/api/quizzes`

### Generate quiz
`POST /generate`

Form-data parameters:
- `file` (required): uploaded document
- `title` (optional): quiz title
- `numQuestions` (optional, default `10`): integer 1..50
- `difficulty` (optional, default `medium`): `easy|medium|hard`

Example (PowerShell):

```powershell
$form = @{
  file = Get-Item "C:\path\to\notes.pdf"
  title = "Operating Systems Quiz"
  numQuestions = 15
  difficulty = "hard"
}
Invoke-RestMethod -Uri "http://localhost:8082/api/quizzes/generate" -Method Post -Form $form
```

### Get all quizzes
`GET /`

Example:

```powershell
Invoke-RestMethod "http://localhost:8082/api/quizzes"
```

### Get quiz by ID
`GET /{id}`

Example:

```powershell
Invoke-RestMethod "http://localhost:8082/api/quizzes/1"
```

## Data Model

### Quiz
- `id` (Long)
- `title` (String)
- `createdAt` (LocalDateTime)
- `status` (String: `GENERATING|READY|FAILED`)
- `requestedQuestionCount` (Integer)
- `difficulty` (String)
- `questions` (One-to-many)

### Question
- `id` (Long)
- `questionText` (Text)
- `options` (Element collection in `question_options` table)
- `correctAnswerIndex` (Integer)
- `category` (String)

## Runtime Flow

1. User uploads file from frontend.
2. Frontend posts file + options (`numQuestions`, `difficulty`) to backend.
3. Backend extracts text from document.
4. Backend saves quiz with `GENERATING` status.
5. Async generation creates questions from text chunks using LLM.
6. Backend saves questions and marks quiz `READY`.
7. Dashboard/history fetch quizzes from `/api/quizzes`.

## Troubleshooting

### 1) Dashboard shows: Unable to load dashboard data
Check:
- Backend is running on port `8082`.
- API works: `http://localhost:8082/api/quizzes` returns `200`.
- Frontend is running on `5173`.

### 2) Vite proxy error ECONNREFUSED for /api/quizzes
Cause: backend is not reachable.
Fix:
- Start backend in `backend/`.
- Verify port usage:

```powershell
netstat -ano | findstr :8082
```

If wrong stale process exists, stop it:

```powershell
Stop-Process -Id <PID> -Force
```

### 3) Backend fails to start because port 8082 is already in use
Either stop existing process or change:

```properties
server.port=8082
```

### 4) PostgreSQL errors on startup
Check:
- DB exists: `autoquizgen`
- Username/password are correct
- PostgreSQL service is running

### 5) LLM generation returns empty quiz
Check:
- `llama.api.url` points to a running endpoint
- Endpoint supports chat completion style request

### 6) Relative path issue when switching folders in PowerShell
From `frontend`, use:

```powershell
Set-Location ..\backend
```

From project root, use:

```powershell
Set-Location backend
```

## Available Commands

Frontend (`frontend/`):
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

Backend (`backend/`):
- `.\mvnw.cmd spring-boot:run`
- `.\mvnw.cmd test`
- `.\mvnw.cmd -DskipTests compile`
- `.\mvnw.cmd clean package`

## Future Improvements
- Add user authentication with persistent user accounts.
- Add per-user quiz ownership and history filters.
- Add quiz score persistence and analytics.
- Add Docker setup for backend, frontend, and PostgreSQL.
- Add migration management (Flyway/Liquibase) for safer schema evolution.

---

If you want, I can also create:
1. A separate `backend/README.md` with API-focused docs.
2. A separate `frontend/README.md` with UI/development workflow.
3. A `DEPLOYMENT.md` for production setup (Nginx + systemd + PostgreSQL + SSL).

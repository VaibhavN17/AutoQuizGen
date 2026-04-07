# AutoQuizGen Project Report

## 1. Project Title
AutoQuizGen: AI-Powered Quiz Generation System from Document Content

## 2. Abstract
AutoQuizGen is a full-stack web application that converts uploaded study material into multiple-choice quizzes using a Large Language Model (LLM). The system extracts text from PDF, DOCX, and TXT files, processes and chunks the extracted content, and generates structured quiz questions with configurable parameters such as question count and difficulty level. The generated quizzes are persisted in PostgreSQL and made available for interactive quiz sessions, dashboard analytics, and history review.

The solution is built with a React + Vite frontend and a Spring Boot backend using JPA for persistence. The backend integrates with a local OpenAI-compatible LLM endpoint. This project demonstrates practical AI integration in education technology, combining document understanding, asynchronous processing, and user-centric quiz workflows.

## 3. Problem Statement
Students and learners often spend significant time manually creating self-assessment questions from notes, PDFs, or class documents. Existing tools either provide generic quizzes or require manual input. There is a need for a system that can:
- Automatically extract relevant content from uploaded documents.
- Generate high-quality MCQs aligned with the source material.
- Allow user control over quiz size and difficulty.
- Store and manage generated quizzes for repeated learning and revision.

## 4. Objectives
Primary objectives:
- Build an end-to-end document-to-quiz generation platform.
- Support upload and parsing of PDF, DOCX, and TXT files.
- Integrate LLM-based question generation.
- Provide configurable question count (1 to 50) and difficulty (easy, medium, hard).
- Persist generated quizzes and questions in PostgreSQL.
- Provide intuitive UI for dashboard, generation, quiz attempt, and history.

Secondary objectives:
- Ensure backend scalability using asynchronous generation.
- Handle API and parsing failures gracefully.
- Maintain clean architecture for future extension (scores, users, analytics).

## 5. Scope
### In Scope
- Document upload and extraction.
- AI-driven MCQ generation.
- Quiz listing, retrieval, and attempt flow.
- Basic dashboard and history views.
- Persistence of quiz metadata and question data.

### Out of Scope (Current Version)
- User account persistence and role management.
- Advanced analytics with long-term learning metrics.
- Human-in-the-loop validation of generated questions.
- Production-grade deployment automation (container orchestration, CI/CD).

## 6. Technology Stack
### Frontend
- React 19
- Vite 8
- React Router
- Tailwind CSS v4

### Backend
- Java 21
- Spring Boot 3.2
- Spring Web
- Spring Data JPA
- Spring Validation
- Asynchronous processing via @Async

### Database
- PostgreSQL

### Document Parsing
- Apache PDFBox (PDF)
- Apache POI (DOCX)

### AI Integration
- Local/OpenAI-compatible chat completion endpoint
- Configured through llama.api.url

## 7. High-Level System Architecture
1. User uploads a document from frontend.
2. Frontend sends multipart request with file + settings (question count, difficulty).
3. Backend extracts text and creates initial quiz record with GENERATING state.
4. Backend chunks extracted text and calls LLM service.
5. LLM response is parsed into Question entities.
6. Questions are saved under quiz and status is updated to READY.
7. Frontend fetches quiz data for dashboard, history, and quiz attempt.

## 8. Project Structure
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
  PROJECT_REPORT.md
```

## 9. Detailed Module Description

### 9.1 Frontend Modules
- Login page: user access entry and session state management.
- Upload page: file upload, progress simulation, question count and difficulty input.
- Processing page: generation progress workflow and API trigger.
- Quiz page: interactive question solving experience.
- Results page: score output and summary.
- Dashboard page: overview of generated quizzes and recent activity.
- History page: list of previous quizzes and re-attempt options.
- API utility: environment-aware API base URL handling.

### 9.2 Backend Modules
- Controller layer:
  - Exposes REST endpoints for quiz generation and retrieval.
- Service layer:
  - FileExtractionService: extracts text from uploaded files.
  - TextChunkingService: segments large text for manageable LLM prompts.
  - LlamaService: communicates with chat completion endpoint.
  - ResponseParserService: converts LLM JSON into Question objects.
  - QuizService: orchestrates complete quiz generation lifecycle and persistence.
- Repository layer:
  - QuizRepository extends JpaRepository for data access.
- Model layer:
  - Quiz and Question entities mapped with JPA annotations.

## 10. Database Design

### 10.1 Entity: Quiz
Key fields:
- id (Primary Key)
- title
- createdAt
- status (GENERATING, READY, FAILED)
- requestedQuestionCount
- difficulty
- questions (One-to-many relationship)

### 10.2 Entity: Question
Key fields:
- id (Primary Key)
- questionText
- options (element collection)
- correctAnswerIndex
- category

### 10.3 Table-Level Relationship
- One Quiz contains multiple Questions.
- question_options table stores options for each question.

## 11. API Design
Base URL: /api/quizzes

### 11.1 Generate Quiz
POST /generate
- Content-Type: multipart/form-data
- Parameters:
  - file (required)
  - title (optional)
  - numQuestions (optional, default 10, range 1..50)
  - difficulty (optional, default medium, values easy|medium|hard)

Response:
- Initial created quiz object with GENERATING status.

### 11.2 Get All Quizzes
GET /
- Returns list of all stored quizzes.

### 11.3 Get Quiz by ID
GET /{id}
- Returns quiz details including question list.

## 12. Core Workflow and Logic

### 12.1 Quiz Generation Flow
1. Validate and sanitize inputs:
   - numQuestions clamped to 1..50.
   - difficulty normalized to easy/medium/hard.
2. Extract document text.
3. Create quiz record in DB with status GENERATING.
4. Trigger asynchronous generation.
5. Split content into chunks.
6. Perform iterative LLM calls until requested count is reached or attempt threshold reached.
7. Parse JSON responses into Question entities.
8. Persist questions and update status to READY.
9. On exception, set status to FAILED.

### 12.2 Why Iterative Generation Was Added
Initial behavior often returned around 10 questions due to single-pass generation limits from LLM responses. The generation loop was improved to repeatedly request remaining questions until the user-selected target count is reached (up to configured maximum), improving reliability for larger quizzes.

## 13. Configuration
Important backend properties:
- server.port=8082
- spring.datasource.url=jdbc:postgresql://localhost:5432/autoquizgen
- spring.datasource.username=postgres
- spring.datasource.password=<your-password>
- spring.jpa.hibernate.ddl-auto=update
- llama.api.url=http://127.0.0.1:8081/v1/chat/completions

Frontend behavior:
- Dev mode uses Vite proxy for /api.
- Build/preview mode uses configured API base fallback to localhost:8082/api.

## 14. Error Handling and Reliability
Implemented protections include:
- Defensive frontend parsing for non-OK/non-array API responses.
- API fallback URL strategy for dev and production-like modes.
- CORS configuration for localhost port patterns.
- Backend status tracking for generation states.
- Robust parsing for LLM responses wrapped in markdown or malformed formats.
- Retry/loop generation logic for larger requested question counts.

## 15. Testing and Validation
### Functional checks performed
- Frontend production build successful.
- Backend compile successful after each major change.
- API endpoint /api/quizzes validated for HTTP 200 responses after fixes.
- End-to-end generation flow verified with persisted quiz payloads.

### Manual test scenarios
- Upload valid file and generate quiz.
- Change difficulty and verify persisted value.
- Increase question count above 10 and verify generated count behavior.
- Dashboard and history data loading under backend availability/unavailability.

## 16. Challenges Faced and Solutions

1. Dashboard not loading after login:
- Cause: auth state was in-memory only.
- Fix: persisted auth state in local storage and restored on app startup.

2. Dashboard API errors in dev/prod mismatch:
- Cause: relative API path behavior differed by run mode.
- Fix: environment-aware API URL builder + proper proxy/cors handling.

3. Backend startup and migration issues:
- Cause: schema evolution and stale process/port conflicts.
- Fix: entity adjustments, process cleanup, and startup diagnostics.

4. Question count stuck around 10:
- Cause: single-pass LLM generation practical limit.
- Fix: iterative generation loop until requested count is reached.

## 17. Security and Data Considerations
Current security posture:
- Basic CORS control for localhost during development.
- No persisted user authentication/authorization yet.
- No encryption-at-rest customization beyond DB defaults.

Recommendations:
- Add JWT-based authentication.
- Restrict CORS to exact production origins.
- Add file-type and content scanning hardening.
- Add rate limiting on generation endpoints.

## 18. Performance Considerations
- Async backend generation prevents blocking request threads.
- Text chunking controls payload size sent to LLM.
- Iterative generation may increase latency for high question counts; can be optimized with bounded parallel chunk execution and deduplication.

## 19. Future Enhancements
- User account system with per-user quiz ownership.
- Score persistence and detailed analytics dashboard.
- Difficulty calibration based on prior user performance.
- Duplicate-question detection and semantic ranking.
- Automated tests for services and controller endpoints.
- Containerized deployment with Docker Compose.
- CI/CD pipeline for build, test, and deployment.

## 20. Conclusion
AutoQuizGen successfully delivers an AI-assisted learning workflow that transforms static study documents into interactive quizzes. The project combines document parsing, LLM prompt orchestration, asynchronous backend processing, and modern frontend UX. Recent improvements to configurable question count and iterative generation significantly enhance practical usability. The architecture is modular and extensible, making it suitable for further evolution into a production-grade educational platform.

## 21. References
- Spring Boot Documentation
- Spring Data JPA Documentation
- React Documentation
- Vite Documentation
- PostgreSQL Documentation
- Apache PDFBox Documentation
- Apache POI Documentation
- OpenAI-compatible Chat Completions API format

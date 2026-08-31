# Agile Project Management Tool

A lightweight, full-stack Agile project management platform built for small software teams. The application provides clean project management through the **Project → User Story → Task** hierarchy, a Kanban board, sprint management, backlog, analytics, and asynchronous report generation.

---

## Project Overview

This application enables a small software team to plan, track, and complete Agile work. Users can create projects, organize them into user stories, break stories into tasks, plan and run sprints, view analytics, and generate background progress reports — all through a minimal, professional interface.

---

## Features

- **Project Management** — Create, view, edit, and delete projects with live progress metrics
- **User Story Management** — Full CRUD with story points (Fibonacci: 1, 2, 3, 5, 8), priority, status, acceptance criteria
- **Task Management** — Create tasks under stories; set status, priority, assignee, blocked state
- **Kanban Board** — Drag-and-drop board: To Do, In Progress, In Review, Done
- **Backlog** — Dedicated backlog view; assign stories to sprints
- **Sprint Management** — Create sprints with date ranges; track story points and progress
- **Task Detail Modal** — Full task detail with inline editing and comment thread
- **Comments** — Add timestamped comments to tasks
- **Dashboard** — Project overview with task counts, completion percentage, active sprint summary
- **Analytics** — Burndown chart and velocity chart from real data
- **Async Report Generation** — Background report with polling, failure handling, and retry
- **Seed Data** — Demo project for immediate demonstration
- **OpenAPI Documentation** — Swagger UI at `/api/docs`

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | Component-based UI and state |
| Vite | Fast development server and build |
| Tailwind CSS | Utility-first styling with custom design tokens |
| React Router v6 | Client-side routing |
| Axios | HTTP client with interceptors |
| Recharts | Burndown and velocity chart visualisations |
| @hello-pangea/dnd | Drag-and-drop Kanban board |

### Backend
| Technology | Purpose |
|---|---|
| Python 3.11+ | Application language |
| FastAPI | REST API framework with automatic OpenAPI docs |
| Pydantic v2 | Request/response validation |
| SQLAlchemy 2.x | ORM for database interaction |
| SQLite | Embedded relational database |
| uvicorn | ASGI server |

---

## Architecture

```
Browser (React)
    │  Axios HTTP (Vite proxy → localhost:8000)
    ▼
FastAPI (port 8000)
    Routers → Services → SQLAlchemy ORM
    │
    ▼
SQLite (app.db)

Background Workflow:
POST /api/reports/generate
    → Creates Report row (pending)
    → FastAPI BackgroundTasks queues generate_report()
    → Returns immediately to frontend
    → Worker runs: processing → completed/failed
GET /api/reports/{id}  ← Frontend polls every 3s
```

---

## Setup Instructions

### Requirements
- Python 3.11 or higher
- Node.js 18 or higher

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env

# (Optional) Seed demo data
python seed.py

# Start backend server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

npm install
copy .env.example .env
npm run dev
```

Open http://localhost:5173

### Environment Variables

**backend/.env**
```
DATABASE_URL=sqlite:///./app.db
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
APP_ENV=development
```

**frontend/.env**
```
VITE_API_BASE_URL=http://localhost:8000
```

---

## API Documentation

| URL | Description |
|---|---|
| http://localhost:8000/api/docs | Swagger UI (interactive) |
| http://localhost:8000/api/redoc | ReDoc |

### Endpoints

| Resource | Routes |
|---|---|
| Projects | GET/POST /api/projects, GET/PUT/DELETE /api/projects/{id} |
| Sprints | GET/POST /api/sprints, GET/PUT /api/sprints/{id}, POST /api/sprints/{id}/stories |
| Stories | GET/POST /api/stories, GET/PUT/DELETE /api/stories/{id} |
| Tasks | GET/POST /api/tasks, GET/PUT/DELETE /api/tasks/{id}, PATCH /api/tasks/{id}/status, PATCH /api/tasks/{id}/toggle-block |
| Comments | GET/POST /api/tasks/{task_id}/comments |
| Analytics | GET /api/analytics/project/{id}/stats, GET /api/analytics/sprint/{id}/burndown, GET /api/analytics/project/{id}/velocity |
| Reports | POST /api/reports/generate, GET /api/reports/{id}, GET /api/reports/project/{id}, POST /api/reports/{id}/retry |

---

## Database Schema

```
projects          (id, name, description, status, created_at, updated_at)
sprints           (id, project_id→projects, name, goal, start_date, end_date, status, created_at, updated_at)
user_stories      (id, project_id→projects, sprint_id→sprints NULL, title, description,
                   acceptance_criteria, priority, story_points, status, created_at, updated_at)
tasks             (id, story_id→user_stories, title, description, status, priority,
                   assignee, is_blocked, created_at, updated_at)
comments          (id, task_id→tasks, author, body, created_at)
reports           (id, project_id→projects, status, report_data JSON, error_message, created_at, completed_at)
```

**Relationships:** Project → (many) UserStories → (many) Tasks → (many) Comments
                   Project → (many) Sprints
                   Sprint → (many) UserStories (nullable)

---

## Design Decisions

- **SQLite**: Zero infrastructure overhead; sufficient for small team per assignment spec
- **FastAPI BackgroundTasks**: Built-in, no Redis/Celery needed; I/O-bound report generation fits this model
- **No Redux**: Custom hooks + useState is sufficient; Redux would be premature complexity
- **@hello-pangea/dnd**: Maintained fork of react-beautiful-dnd; React 18 compatible
- **Story-level burndown**: Sprint planning at story level matches real Agile practice; tasks are implementation detail
- **Free-text assignee**: No auth in scope; keeps focus on project management

---

## Tradeoffs

| Decision | Tradeoff |
|---|---|
| SQLite | No concurrent writes; swap PostgreSQL for production |
| BackgroundTasks | Pending reports lost on server restart; acceptable for demo |
| No authentication | Any user can edit any item; intentional per scope |
| Client polling | 3-second polling vs WebSocket; simpler and sufficient |
| Story-level burndown | Less granular than per-task; more stable for demonstration |

---

## Security Considerations

- All request bodies validated by Pydantic (422 on invalid input)
- SQLAlchemy ORM used throughout — no raw SQL
- CORS configured explicitly from environment variable (not wildcard)
- Configuration loaded from .env (excluded from git)
- All service functions validate entity existence before operations
- Status values validated against enums at schema level
- Story points validated against [1,2,3,5,8] in Pydantic validators
- Internal error tracebacks stored in DB, not exposed to API clients

---

## Async Workflow

### Report Generation

1. Frontend: `POST /api/reports/generate` with `{project_id}`
2. Backend: Creates Report row (`status=pending`), returns it instantly
3. FastAPI queues `generate_report()` as BackgroundTask (own DB session via SessionLocal)
4. Worker: `pending → processing → completed` (or `failed` on error)
5. Frontend: polls `GET /api/reports/{id}` every 3 seconds
6. On completion: report JSON displayed in UI

### Failure Handling

- Exception in worker → `status=failed`, Python traceback in `error_message`
- Frontend shows "Retry" button on failure
- `POST /api/reports/{id}/retry` → resets to `pending`, re-queues task

---

## AI Usage

AI tools (Antigravity/Claude) were used during development to generate boilerplate code, component structure, and this README. The application itself contains **no AI or ML functionality** — all logic is deterministic CRUD, status transitions, date arithmetic, and aggregation queries.

---

## Future Improvements

1. User authentication (JWT + role-based access)
2. Real-time updates via WebSocket
3. File attachments on tasks
4. Per-task granularity burndown
5. Sprint retrospective notes
6. PDF/CSV report export
7. PostgreSQL support for production
8. Dark mode
9. Epic tier above User Stories
10. Time tracking on tasks

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, CORS_ORIGINS
from app.database import Base
import app.models  # noqa: F401 — registers all models with SQLAlchemy
from app.routers import projects, sprints, user_stories, tasks, comments, analytics, reports

app = FastAPI(
    title="Agile Project Management Tool",
    description="""A lightweight Agile project management platform for small software teams.

Provides REST APIs for managing:
- Projects, User Stories, Tasks
- Sprints and Backlogs
- Agile Kanban board workflow
- Analytics: burndown and velocity charts
- Asynchronous progress report generation
""",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(projects.router, prefix="/api", tags=["Projects"])
app.include_router(sprints.router, prefix="/api", tags=["Sprints"])
app.include_router(user_stories.router, prefix="/api", tags=["User Stories"])
app.include_router(tasks.router, prefix="/api", tags=["Tasks"])
app.include_router(comments.router, prefix="/api", tags=["Comments"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])

@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "version": "1.0.0"}

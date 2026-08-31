from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.services import project_service

router = APIRouter()

@router.get("/projects", response_model=List[ProjectResponse], summary="List all projects")
def list_projects(db: Session = Depends(get_db)):
    """Return all projects with task/story counts."""
    return project_service.get_projects(db)

@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED, summary="Create a project")
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project."""
    return project_service.create_project(db, payload)

@router.get("/projects/{project_id}", response_model=ProjectResponse, summary="Get a project")
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Retrieve a single project by ID."""
    return project_service.get_project(db, project_id)

@router.put("/projects/{project_id}", response_model=ProjectResponse, summary="Update a project")
def update_project(project_id: int, payload: ProjectUpdate, db: Session = Depends(get_db)):
    """Update project fields."""
    return project_service.update_project(db, project_id, payload)

@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a project")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    """Delete a project and all its stories, tasks, and comments."""
    project_service.delete_project(db, project_id)

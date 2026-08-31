from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from app.models.project import Project
from app.models.user_story import UserStory
from app.models.task import Task
from app.schemas.project import ProjectCreate, ProjectUpdate

def get_projects(db: Session) -> List[dict]:
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    result = []
    for p in projects:
        story_ids = [s.id for s in p.user_stories]
        task_count = db.query(func.count(Task.id)).filter(Task.story_id.in_(story_ids)).scalar() if story_ids else 0
        completed = db.query(func.count(Task.id)).filter(Task.story_id.in_(story_ids), Task.status == "done").scalar() if story_ids else 0
        result.append({
            "id": p.id, "name": p.name, "description": p.description,
            "status": p.status, "created_at": p.created_at, "updated_at": p.updated_at,
            "story_count": len(p.user_stories), "task_count": task_count, "completed_task_count": completed
        })
    return result

def get_project(db: Session, project_id: int) -> dict:
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
    story_ids = [s.id for s in p.user_stories]
    task_count = db.query(func.count(Task.id)).filter(Task.story_id.in_(story_ids)).scalar() if story_ids else 0
    completed = db.query(func.count(Task.id)).filter(Task.story_id.in_(story_ids), Task.status == "done").scalar() if story_ids else 0
    return {
        "id": p.id, "name": p.name, "description": p.description,
        "status": p.status, "created_at": p.created_at, "updated_at": p.updated_at,
        "story_count": len(p.user_stories), "task_count": task_count, "completed_task_count": completed
    }

def create_project(db: Session, schema: ProjectCreate) -> dict:
    project = Project(name=schema.name, description=schema.description, status=schema.status)
    db.add(project)
    db.commit()
    db.refresh(project)
    return {"id": project.id, "name": project.name, "description": project.description,
            "status": project.status, "created_at": project.created_at, "updated_at": project.updated_at,
            "story_count": 0, "task_count": 0, "completed_task_count": 0}

def update_project(db: Session, project_id: int, schema: ProjectUpdate) -> dict:
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
    for field, value in schema.model_dump(exclude_unset=True).items():
        setattr(p, field, value)
    db.commit()
    db.refresh(p)
    return get_project(db, project_id)

def delete_project(db: Session, project_id: int) -> None:
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
    db.delete(p)
    db.commit()

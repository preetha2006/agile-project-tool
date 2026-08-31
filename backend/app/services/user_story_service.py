from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from app.models.user_story import UserStory
from app.models.task import Task
from app.models.project import Project
from app.schemas.user_story import UserStoryCreate, UserStoryUpdate

def _enrich(db: Session, story: UserStory) -> dict:
    task_count = db.query(func.count(Task.id)).filter(Task.story_id == story.id).scalar()
    completed = db.query(func.count(Task.id)).filter(Task.story_id == story.id, Task.status == "done").scalar()
    return {
        "id": story.id, "project_id": story.project_id, "sprint_id": story.sprint_id,
        "title": story.title, "description": story.description,
        "acceptance_criteria": story.acceptance_criteria, "priority": story.priority,
        "story_points": story.story_points, "status": story.status,
        "created_at": story.created_at, "updated_at": story.updated_at,
        "task_count": task_count, "completed_task_count": completed
    }

def get_stories(db: Session, project_id: Optional[int] = None, sprint_id: Optional[int] = None, status: Optional[str] = None) -> List[dict]:
    q = db.query(UserStory)
    if project_id:
        q = q.filter(UserStory.project_id == project_id)
    if sprint_id:
        q = q.filter(UserStory.sprint_id == sprint_id)
    if status:
        q = q.filter(UserStory.status == status)
    stories = q.order_by(UserStory.created_at.desc()).all()
    return [_enrich(db, s) for s in stories]

def get_story(db: Session, story_id: int) -> dict:
    story = db.query(UserStory).filter(UserStory.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail=f"Story {story_id} not found")
    return _enrich(db, story)

def create_story(db: Session, schema: UserStoryCreate) -> dict:
    project = db.query(Project).filter(Project.id == schema.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {schema.project_id} not found")
    story = UserStory(
        project_id=schema.project_id, sprint_id=schema.sprint_id, title=schema.title,
        description=schema.description, acceptance_criteria=schema.acceptance_criteria,
        priority=schema.priority, story_points=schema.story_points, status=schema.status
    )
    db.add(story)
    db.commit()
    db.refresh(story)
    return _enrich(db, story)

def update_story(db: Session, story_id: int, schema: UserStoryUpdate) -> dict:
    story = db.query(UserStory).filter(UserStory.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail=f"Story {story_id} not found")
    for field, value in schema.model_dump(exclude_unset=True).items():
        setattr(story, field, value)
    db.commit()
    db.refresh(story)
    return _enrich(db, story)

def delete_story(db: Session, story_id: int) -> None:
    story = db.query(UserStory).filter(UserStory.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail=f"Story {story_id} not found")
    db.delete(story)
    db.commit()

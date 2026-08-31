from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from app.models.task import Task
from app.models.user_story import UserStory
from app.schemas.task import TaskCreate, TaskUpdate

def _enrich(task: Task) -> dict:
    return {
        "id": task.id, "story_id": task.story_id, "title": task.title,
        "description": task.description, "status": task.status, "priority": task.priority,
        "assignee": task.assignee, "is_blocked": task.is_blocked,
        "created_at": task.created_at, "updated_at": task.updated_at,
        "story_title": task.story.title if task.story else None,
        "project_id": task.story.project_id if task.story else None
    }

def get_tasks(db: Session, story_id: Optional[int] = None, status: Optional[str] = None, project_id: Optional[int] = None) -> List[dict]:
    q = db.query(Task).options(joinedload(Task.story))
    if story_id:
        q = q.filter(Task.story_id == story_id)
    if status:
        q = q.filter(Task.status == status)
    if project_id:
        q = q.join(UserStory).filter(UserStory.project_id == project_id)
    tasks = q.order_by(Task.created_at.desc()).all()
    return [_enrich(t) for t in tasks]

def get_task(db: Session, task_id: int) -> dict:
    task = db.query(Task).options(joinedload(Task.story)).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    return _enrich(task)

def create_task(db: Session, schema: TaskCreate) -> dict:
    story = db.query(UserStory).filter(UserStory.id == schema.story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail=f"Story {schema.story_id} not found")
    task = Task(
        story_id=schema.story_id, title=schema.title, description=schema.description,
        status=schema.status, priority=schema.priority, assignee=schema.assignee,
        is_blocked=schema.is_blocked
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    
    task_with_story = db.query(Task).options(joinedload(Task.story)).filter(Task.id == task.id).first()
    return _enrich(task_with_story)

def update_task(db: Session, task_id: int, schema: TaskUpdate) -> dict:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    if schema.story_id is not None:
        story = db.query(UserStory).filter(UserStory.id == schema.story_id).first()
        if not story:
            raise HTTPException(status_code=404, detail=f"Story {schema.story_id} not found")
    for field, value in schema.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit()
    
    task_with_story = db.query(Task).options(joinedload(Task.story)).filter(Task.id == task.id).first()
    return _enrich(task_with_story)

def delete_task(db: Session, task_id: int) -> None:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    db.delete(task)
    db.commit()

def update_task_status(db: Session, task_id: int, status: str) -> dict:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    task.status = status
    db.commit()
    
    task_with_story = db.query(Task).options(joinedload(Task.story)).filter(Task.id == task.id).first()
    return _enrich(task_with_story)

def toggle_block(db: Session, task_id: int) -> dict:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    task.is_blocked = not task.is_blocked
    db.commit()
    
    task_with_story = db.query(Task).options(joinedload(Task.story)).filter(Task.id == task.id).first()
    return _enrich(task_with_story)

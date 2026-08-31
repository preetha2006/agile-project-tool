from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskStatusUpdate
from app.services import task_service

router = APIRouter()

@router.get("/tasks", response_model=List[TaskResponse], summary="List tasks")
def list_tasks(story_id: Optional[int] = None, status: Optional[str] = None, project_id: Optional[int] = None, db: Session = Depends(get_db)):
    return task_service.get_tasks(db, story_id, status, project_id)

@router.post("/tasks", response_model=TaskResponse, status_code=201, summary="Create a task")
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    return task_service.create_task(db, payload)

@router.get("/tasks/{task_id}", response_model=TaskResponse, summary="Get a task")
def get_task(task_id: int, db: Session = Depends(get_db)):
    return task_service.get_task(db, task_id)

@router.put("/tasks/{task_id}", response_model=TaskResponse, summary="Update a task")
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    return task_service.update_task(db, task_id, payload)

@router.delete("/tasks/{task_id}", status_code=204, summary="Delete a task")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task_service.delete_task(db, task_id)

@router.patch("/tasks/{task_id}/status", response_model=TaskResponse, summary="Update task status")
def update_task_status(task_id: int, payload: TaskStatusUpdate, db: Session = Depends(get_db)):
    return task_service.update_task_status(db, task_id, payload.status)

@router.patch("/tasks/{task_id}/toggle-block", response_model=TaskResponse, summary="Toggle task blocked state")
def toggle_block(task_id: int, db: Session = Depends(get_db)):
    return task_service.toggle_block(db, task_id)

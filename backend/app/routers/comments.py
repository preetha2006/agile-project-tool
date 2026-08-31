from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.comment import CommentCreate, CommentResponse
from app.models.comment import Comment
from app.models.task import Task
from fastapi import HTTPException

router = APIRouter()

@router.get("/tasks/{task_id}/comments", response_model=List[CommentResponse], summary="List comments for a task")
def list_comments(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    comments = db.query(Comment).filter(Comment.task_id == task_id).order_by(Comment.created_at).all()
    return comments

@router.post("/tasks/{task_id}/comments", response_model=CommentResponse, status_code=201, summary="Add a comment to a task")
def add_comment(task_id: int, payload: CommentCreate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    comment = Comment(task_id=task_id, author=payload.author, body=payload.body)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

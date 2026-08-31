from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user_story import UserStoryCreate, UserStoryUpdate, UserStoryResponse
from app.services import user_story_service

router = APIRouter()

@router.get("/stories", response_model=List[UserStoryResponse], summary="List user stories")
def list_stories(project_id: Optional[int] = None, sprint_id: Optional[int] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    return user_story_service.get_stories(db, project_id, sprint_id, status)

@router.post("/stories", response_model=UserStoryResponse, status_code=201, summary="Create a user story")
def create_story(payload: UserStoryCreate, db: Session = Depends(get_db)):
    return user_story_service.create_story(db, payload)

@router.get("/stories/{story_id}", response_model=UserStoryResponse, summary="Get a user story")
def get_story(story_id: int, db: Session = Depends(get_db)):
    return user_story_service.get_story(db, story_id)

@router.put("/stories/{story_id}", response_model=UserStoryResponse, summary="Update a user story")
def update_story(story_id: int, payload: UserStoryUpdate, db: Session = Depends(get_db)):
    return user_story_service.update_story(db, story_id, payload)

@router.delete("/stories/{story_id}", status_code=204, summary="Delete a user story")
def delete_story(story_id: int, db: Session = Depends(get_db)):
    user_story_service.delete_story(db, story_id)

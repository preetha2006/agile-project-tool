from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.sprint import SprintCreate, SprintUpdate, SprintResponse, AddStoriesToSprint
from app.services import sprint_service

router = APIRouter()

@router.get("/sprints", response_model=List[SprintResponse], summary="List sprints for a project")
def list_sprints(project_id: int, db: Session = Depends(get_db)):
    return sprint_service.get_sprints(db, project_id)

@router.post("/sprints", response_model=SprintResponse, status_code=status.HTTP_201_CREATED, summary="Create a sprint")
def create_sprint(payload: SprintCreate, db: Session = Depends(get_db)):
    return sprint_service.create_sprint(db, payload)

@router.get("/sprints/{sprint_id}", response_model=SprintResponse, summary="Get a sprint")
def get_sprint(sprint_id: int, db: Session = Depends(get_db)):
    return sprint_service.get_sprint(db, sprint_id)

@router.put("/sprints/{sprint_id}", response_model=SprintResponse, summary="Update a sprint")
def update_sprint(sprint_id: int, payload: SprintUpdate, db: Session = Depends(get_db)):
    return sprint_service.update_sprint(db, sprint_id, payload)

@router.post("/sprints/{sprint_id}/stories", response_model=SprintResponse, summary="Add stories to a sprint")
def add_stories_to_sprint(sprint_id: int, payload: AddStoriesToSprint, db: Session = Depends(get_db)):
    return sprint_service.add_stories_to_sprint(db, sprint_id, payload)

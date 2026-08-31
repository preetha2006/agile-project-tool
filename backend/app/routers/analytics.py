from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import analytics_service

router = APIRouter()

@router.get("/analytics/project/{project_id}/stats", summary="Get project statistics")
def project_stats(project_id: int, db: Session = Depends(get_db)):
    """Returns task counts, completion percentage, and active sprint info."""
    return analytics_service.get_project_stats(db, project_id)

@router.get("/analytics/sprint/{sprint_id}/burndown", summary="Get sprint burndown data")
def sprint_burndown(sprint_id: int, db: Session = Depends(get_db)):
    """Returns daily remaining story points for the burndown chart."""
    return analytics_service.get_burndown_data(db, sprint_id)

@router.get("/analytics/project/{project_id}/velocity", summary="Get velocity data")
def project_velocity(project_id: int, db: Session = Depends(get_db)):
    """Returns completed story points per completed sprint."""
    return analytics_service.get_velocity_data(db, project_id)

from typing import List
from fastapi import APIRouter, Depends, BackgroundTasks, status
from sqlalchemy.orm import Session
from app.database import get_db, SessionLocal
from app.schemas.report import ReportRequest, ReportResponse
from app.services import report_service
from app.background.report_worker import generate_report

router = APIRouter()

@router.get("/reports/project/{project_id}", response_model=List[ReportResponse], summary="List reports for a project")
def list_reports(project_id: int, db: Session = Depends(get_db)):
    return report_service.get_reports_for_project(db, project_id)

@router.post("/reports/generate", response_model=ReportResponse, status_code=201, summary="Start report generation")
def start_report(payload: ReportRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Accepts a report generation request and immediately returns a report record
    with status='pending'. The actual report generation runs in the background.
    Poll GET /api/reports/{id} to check status.
    """
    report = report_service.create_report(db, payload.project_id)
    background_tasks.add_task(generate_report, report.id, payload.project_id, SessionLocal)
    return report_service.get_report(db, report.id)

@router.get("/reports/{report_id}", response_model=ReportResponse, summary="Get report status and data")
def get_report(report_id: int, db: Session = Depends(get_db)):
    """Poll this endpoint to check report status: pending/processing/completed/failed."""
    return report_service.get_report(db, report_id)

@router.post("/reports/{report_id}/retry", response_model=ReportResponse, summary="Retry a failed report")
def retry_report(report_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Resets a failed report to 'pending' and re-queues generation.
    """
    report = report_service.retry_report(db, report_id)
    background_tasks.add_task(generate_report, report.id, report.project_id, SessionLocal)
    return report_service.get_report(db, report.id)

from typing import List
import json
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.report import Report

def create_report(db: Session, project_id: int) -> Report:
    report = Report(project_id=project_id, status="pending")
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

def get_report(db: Session, report_id: int) -> dict:
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail=f"Report {report_id} not found")
    data = None
    if report.report_data:
        try:
            data = json.loads(report.report_data)
        except Exception:
            data = None
    return {
        "id": report.id, "project_id": report.project_id, "status": report.status,
        "report_data": data, "error_message": report.error_message,
        "created_at": report.created_at, "completed_at": report.completed_at
    }

def get_reports_for_project(db: Session, project_id: int) -> List[dict]:
    reports = db.query(Report).filter(Report.project_id == project_id).order_by(Report.created_at.desc()).all()
    return [get_report(db, r.id) for r in reports]

def retry_report(db: Session, report_id: int) -> Report:
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail=f"Report {report_id} not found")
    if report.status not in ["failed", "completed"]:
        raise HTTPException(status_code=400, detail="Only failed or completed reports can be retried")
    report.status = "pending"
    report.error_message = None
    report.report_data = None
    report.completed_at = None
    db.commit()
    db.refresh(report)
    return report

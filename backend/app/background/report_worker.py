import json
import traceback
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.report import Report
from app.models.project import Project
from app.models.sprint import Sprint
from app.services.analytics_service import get_project_stats, get_burndown_data, get_velocity_data

def generate_report(report_id: int, project_id: int, db_factory):
    """
    Background task for generating a project progress report.
    Accepts db_factory (callable returning Session) because FastAPI closes
    the request-scoped session before background tasks complete.

    Failure handling:
    - On any exception: sets report.status = 'failed' and stores the traceback.
    - The frontend can poll /api/reports/{id} to detect failure.
    - A retry endpoint /api/reports/{id}/retry resets status to 'pending'.
    """
    db: Session = db_factory()
    try:
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            return

        report.status = "processing"
        db.commit()

        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise ValueError(f"Project {project_id} not found")

        stats = get_project_stats(db, project_id)
        velocity = get_velocity_data(db, project_id)
        sprints = db.query(Sprint).filter(Sprint.project_id == project_id).order_by(Sprint.created_at).all()
        active_sprint = next((s for s in sprints if s.status == "active"), None)
        burndown = get_burndown_data(db, active_sprint.id) if active_sprint else []

        report_data = {
            "project": {"id": project.id, "name": project.name, "status": project.status},
            "generated_at": datetime.utcnow().isoformat(),
            "summary": stats,
            "velocity": velocity,
            "burndown": burndown,
            "sprints": [
                {
                    "id": s.id, "name": s.name, "status": s.status,
                    "start_date": s.start_date.isoformat() if s.start_date else None,
                    "end_date": s.end_date.isoformat() if s.end_date else None
                }
                for s in sprints
            ]
        }

        report.report_data = json.dumps(report_data)
        report.status = "completed"
        report.completed_at = datetime.utcnow()
        db.commit()

    except Exception as e:
        db.rollback()
        try:
            report = db.query(Report).filter(Report.id == report_id).first()
            if report:
                report.status = "failed"
                report.error_message = f"{type(e).__name__}: {str(e)}\n\n{traceback.format_exc()}"
                db.commit()
        except Exception:
            pass
    finally:
        db.close()

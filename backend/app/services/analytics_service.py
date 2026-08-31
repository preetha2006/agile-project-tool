from typing import List, Optional
from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.project import Project
from app.models.user_story import UserStory
from app.models.task import Task
from app.models.sprint import Sprint
from fastapi import HTTPException

def get_project_stats(db: Session, project_id: int) -> dict:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    stories = db.query(UserStory).filter(UserStory.project_id == project_id).all()
    story_ids = [s.id for s in stories]
    total_tasks = db.query(func.count(Task.id)).filter(Task.story_id.in_(story_ids)).scalar() if story_ids else 0
    completed_tasks = db.query(func.count(Task.id)).filter(Task.story_id.in_(story_ids), Task.status == "done").scalar() if story_ids else 0
    in_progress_tasks = db.query(func.count(Task.id)).filter(Task.story_id.in_(story_ids), Task.status == "in_progress").scalar() if story_ids else 0
    todo_tasks = db.query(func.count(Task.id)).filter(Task.story_id.in_(story_ids), Task.status == "todo").scalar() if story_ids else 0
    completion_pct = round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 1)
    active_sprint = db.query(Sprint).filter(Sprint.project_id == project_id, Sprint.status == "active").first()
    return {
        "total_stories": len(stories),
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "in_progress_tasks": in_progress_tasks,
        "todo_tasks": todo_tasks,
        "completion_percentage": completion_pct,
        "active_sprint": {"id": active_sprint.id, "name": active_sprint.name} if active_sprint else None
    }

def get_burndown_data(db: Session, sprint_id: int) -> List[dict]:
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint or not sprint.start_date or not sprint.end_date:
        return []
    stories = db.query(UserStory).filter(UserStory.sprint_id == sprint_id).all()
    total_points = sum(s.story_points or 0 for s in stories)
    if total_points == 0:
        return []
    today = date.today()
    end = min(sprint.end_date, today)
    result = []
    current = sprint.start_date
    while current <= end:
        # count points of stories NOT yet done as of this date
        # We use story.updated_at as completion date proxy
        remaining = 0
        for story in stories:
            if story.status != "done":
                remaining += story.story_points or 0
            else:
                # Check if story was completed after current date
                # Handle potential timezone-naive datetime from SQLite by converting to date
                if story.updated_at and story.updated_at.date() > current:
                    remaining += story.story_points or 0
        result.append({"date": current.isoformat(), "remaining": remaining})
        current += timedelta(days=1)
    # Ideal burndown
    total_days = (sprint.end_date - sprint.start_date).days or 1
    for i, entry in enumerate(result):
        elapsed = (date.fromisoformat(entry["date"]) - sprint.start_date).days
        entry["ideal"] = round(total_points * (1 - elapsed / total_days), 1)
    return result

def get_velocity_data(db: Session, project_id: int) -> List[dict]:
    sprints = db.query(Sprint).filter(
        Sprint.project_id == project_id,
        Sprint.status == "completed"
    ).order_by(Sprint.end_date).all()
    result = []
    for sprint in sprints:
        stories = db.query(UserStory).filter(
            UserStory.sprint_id == sprint.id,
            UserStory.status == "done"
        ).all()
        completed_pts = sum(s.story_points or 0 for s in stories)
        result.append({"sprint_name": sprint.name, "completed_points": completed_pts, "sprint_id": sprint.id})
    return result

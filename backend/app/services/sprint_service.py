from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.sprint import Sprint
from app.models.user_story import UserStory
from app.schemas.sprint import SprintCreate, SprintUpdate, AddStoriesToSprint

def _enrich_sprint(db: Session, sprint: Sprint) -> dict:
    stories = db.query(UserStory).filter(UserStory.sprint_id == sprint.id).all()
    total_pts = sum(s.story_points or 0 for s in stories)
    completed_pts = sum(s.story_points or 0 for s in stories if s.status == "done")
    return {
        "id": sprint.id, "project_id": sprint.project_id, "name": sprint.name,
        "goal": sprint.goal, "start_date": sprint.start_date, "end_date": sprint.end_date,
        "status": sprint.status, "created_at": sprint.created_at, "updated_at": sprint.updated_at,
        "story_count": len(stories), "total_story_points": total_pts, "completed_story_points": completed_pts
    }

def get_sprints(db: Session, project_id: int) -> List[dict]:
    sprints = db.query(Sprint).filter(Sprint.project_id == project_id).order_by(Sprint.created_at).all()
    return [_enrich_sprint(db, s) for s in sprints]

def get_sprint(db: Session, sprint_id: int) -> dict:
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail=f"Sprint {sprint_id} not found")
    return _enrich_sprint(db, sprint)

def create_sprint(db: Session, schema: SprintCreate) -> dict:
    sprint = Sprint(
        project_id=schema.project_id, name=schema.name, goal=schema.goal,
        start_date=schema.start_date, end_date=schema.end_date, status=schema.status
    )
    db.add(sprint)
    db.commit()
    db.refresh(sprint)
    return _enrich_sprint(db, sprint)

def update_sprint(db: Session, sprint_id: int, schema: SprintUpdate) -> dict:
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail=f"Sprint {sprint_id} not found")
    for field, value in schema.model_dump(exclude_unset=True).items():
        setattr(sprint, field, value)
    db.commit()
    db.refresh(sprint)
    return _enrich_sprint(db, sprint)

def add_stories_to_sprint(db: Session, sprint_id: int, schema: AddStoriesToSprint) -> dict:
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail=f"Sprint {sprint_id} not found")
    for story_id in schema.story_ids:
        story = db.query(UserStory).filter(UserStory.id == story_id).first()
        if not story:
            raise HTTPException(status_code=404, detail=f"Story {story_id} not found")
        if story.project_id != sprint.project_id:
            raise HTTPException(status_code=400, detail=f"Story {story_id} belongs to a different project")
        story.sprint_id = sprint_id
        if story.status == "backlog":
            story.status = "in_sprint"
    db.commit()
    return _enrich_sprint(db, sprint)

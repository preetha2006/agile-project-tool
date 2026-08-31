import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timedelta, date
from app.database import engine, SessionLocal, Base
import app.models  # registers all models
from app.models.project import Project
from app.models.sprint import Sprint
from app.models.user_story import UserStory
from app.models.task import Task
from app.models.comment import Comment

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Project).count() > 0:
            print("Database already seeded. Skipping.")
            return

        today = date.today()
        
        # 1 Project
        project = Project(name="Phoenix Platform", description="A modernized e-commerce engine for Phoenix retail.", status="active")
        db.add(project)
        db.commit()
        db.refresh(project)
        
        # 3 Sprints
        sprint1 = Sprint(project_id=project.id, name="Sprint 01: Auth & Fundamentals", goal="Setup foundational auth and user tracking.", start_date=today - timedelta(days=35), end_date=today - timedelta(days=21), status="completed")
        sprint2 = Sprint(project_id=project.id, name="Sprint 02: Core Workflow", goal="Implement primary task tracking and management.", start_date=today - timedelta(days=20), end_date=today - timedelta(days=7), status="completed")
        sprint3 = Sprint(project_id=project.id, name="Sprint 03: Analytics & Collaboration", goal="Enhance reporting and user interaction.", start_date=today - timedelta(days=3), end_date=today + timedelta(days=11), status="active")
        db.add_all([sprint1, sprint2, sprint3])
        db.commit()
        
        db.refresh(sprint1)
        db.refresh(sprint2)
        db.refresh(sprint3)
        
        # 8 Stories
        s1 = UserStory(project_id=project.id, sprint_id=sprint1.id, title="User authentication and profile management", story_points=5, status="done")
        s2 = UserStory(project_id=project.id, sprint_id=sprint1.id, title="Project creation and management", story_points=3, status="done")
        s3 = UserStory(project_id=project.id, sprint_id=sprint2.id, title="Task board implementation", story_points=8, status="done")
        s4 = UserStory(project_id=project.id, sprint_id=sprint2.id, title="Sprint planning interface", story_points=5, status="done")
        s5 = UserStory(project_id=project.id, sprint_id=sprint3.id, title="Analytics dashboard", story_points=8, status="in_progress")
        s6 = UserStory(project_id=project.id, sprint_id=sprint3.id, title="Comment system and collaboration", story_points=2, status="in_sprint")
        s7 = UserStory(project_id=project.id, sprint_id=None, title="Export and reporting features", story_points=3, status="backlog")
        s8 = UserStory(project_id=project.id, sprint_id=None, title="Mobile responsive design", story_points=5, status="backlog")
        db.add_all([s1, s2, s3, s4, s5, s6, s7, s8])
        db.commit()
        
        db.refresh(s1); db.refresh(s2); db.refresh(s3); db.refresh(s4)
        db.refresh(s5); db.refresh(s6); db.refresh(s7); db.refresh(s8)
        
        # Tasks
        tasks = []
        # Story 1 (done)
        tasks.append(Task(story_id=s1.id, title="Setup JWT handling", status="done"))
        tasks.append(Task(story_id=s1.id, title="Design user profile schema", status="done"))
        # Story 2 (done)
        tasks.append(Task(story_id=s2.id, title="Create project API routes", status="done"))
        tasks.append(Task(story_id=s2.id, title="Implement project model", status="done"))
        # Story 3 (done)
        tasks.append(Task(story_id=s3.id, title="Drag and drop UI components", status="done"))
        tasks.append(Task(story_id=s3.id, title="Task status update endpoint", status="done"))
        # Story 4 (done)
        tasks.append(Task(story_id=s4.id, title="Sprint goal field validation", status="done"))
        tasks.append(Task(story_id=s4.id, title="Date range picker for sprints", status="done"))
        # Story 5 (active, in_progress)
        tasks.append(Task(story_id=s5.id, title="Burndown chart data agg", status="in_progress", assignee="Alice"))
        tasks.append(Task(story_id=s5.id, title="Velocity chart frontend integration", status="todo"))
        tasks.append(Task(story_id=s5.id, title="Fix date timezone issue", status="in_review", is_blocked=True))
        # Story 6 (active, in_sprint)
        tasks.append(Task(story_id=s6.id, title="Comment DB model", status="todo"))
        tasks.append(Task(story_id=s6.id, title="Real-time comment updates", status="todo"))
        # Story 7 (backlog)
        tasks.append(Task(story_id=s7.id, title="PDF generation library research", status="todo"))
        tasks.append(Task(story_id=s7.id, title="Export route handling", status="todo"))
        # Story 8 (backlog)
        tasks.append(Task(story_id=s8.id, title="Audit UI on small screens", status="todo"))
        tasks.append(Task(story_id=s8.id, title="Media queries for Kanban board", status="todo"))
        
        db.add_all(tasks)
        db.commit()
        
        for t in tasks:
            db.refresh(t)
            
        # Comments
        comments = []
        comments.append(Comment(task_id=tasks[8].id, author="Bob", body="Data agg query is running too slow. Optimizing."))
        comments.append(Comment(task_id=tasks[10].id, author="Alice", body="We need clarification on what timezone to use globally."))
        comments.append(Comment(task_id=tasks[4].id, author="Charlie", body="Looks good, reviewed the PR."))
        comments.append(Comment(task_id=tasks[5].id, author="Charlie", body="Merged the status endpoint logic."))
        comments.append(Comment(task_id=tasks[13].id, author="Alice", body="I found a good lib, wkhtmltopdf might work or ReportLab."))
        
        db.add_all(comments)
        db.commit()
        
        task_count = len(tasks)
        comment_count = len(comments)
        
        print(f"Seeded: 1 project, 3 sprints, 8 stories, {task_count} tasks, {comment_count} comments")
    finally:
        db.close()

if __name__ == "__main__":
    seed()

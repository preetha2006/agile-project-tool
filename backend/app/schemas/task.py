from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "todo"
    priority: str = "medium"
    assignee: Optional[str] = None
    is_blocked: bool = False

class TaskCreate(TaskBase):
    story_id: int

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee: Optional[str] = None
    is_blocked: Optional[bool] = None
    story_id: Optional[int] = None

class TaskStatusUpdate(BaseModel):
    status: str

class TaskResponse(TaskBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    story_id: int
    created_at: datetime
    updated_at: datetime
    story_title: Optional[str] = None
    project_id: Optional[int] = None

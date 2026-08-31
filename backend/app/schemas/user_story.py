from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator
from app.utils.constants import STORY_POINTS

class UserStoryBase(BaseModel):
    title: str
    description: Optional[str] = None
    acceptance_criteria: Optional[str] = None
    priority: str = "medium"
    story_points: Optional[int] = None
    status: str = "backlog"

class UserStoryCreate(UserStoryBase):
    project_id: int
    sprint_id: Optional[int] = None

    @field_validator('story_points')
    @classmethod
    def validate_story_points(cls, v):
        if v is not None and v not in STORY_POINTS:
            raise ValueError(f'story_points must be one of {STORY_POINTS}')
        return v

class UserStoryUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    acceptance_criteria: Optional[str] = None
    priority: Optional[str] = None
    story_points: Optional[int] = None
    status: Optional[str] = None
    sprint_id: Optional[int] = None

    @field_validator('story_points')
    @classmethod
    def validate_story_points(cls, v):
        if v is not None and v not in STORY_POINTS:
            raise ValueError(f'story_points must be one of {STORY_POINTS}')
        return v

class UserStoryResponse(UserStoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    project_id: int
    sprint_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    task_count: int = 0
    completed_task_count: int = 0

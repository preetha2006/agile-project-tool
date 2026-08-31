from __future__ import annotations
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, model_validator
from app.utils.constants import SprintStatus

class SprintBase(BaseModel):
    project_id: int
    name: str
    goal: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: SprintStatus = SprintStatus.planning

class SprintCreate(SprintBase):
    @model_validator(mode='after')
    def validate_dates(self):
        if self.start_date and self.end_date and self.start_date >= self.end_date:
            raise ValueError('start_date must be before end_date')
        return self

class SprintUpdate(BaseModel):
    name: Optional[str] = None
    goal: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[SprintStatus] = None

    @model_validator(mode='after')
    def validate_dates(self):
        if self.start_date and self.end_date and self.start_date >= self.end_date:
            raise ValueError('start_date must be before end_date')
        return self

class AddStoriesToSprint(BaseModel):
    story_ids: List[int]

class SprintResponse(SprintBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime
    story_count: int = 0
    total_story_points: int = 0
    completed_story_points: int = 0

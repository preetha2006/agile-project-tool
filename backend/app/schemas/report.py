from __future__ import annotations
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict

class ReportRequest(BaseModel):
    project_id: int

class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    project_id: int
    status: str
    report_data: Optional[Any] = None  # parsed JSON
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

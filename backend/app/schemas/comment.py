from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class CommentBase(BaseModel):
    author: str
    body: str

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    task_id: int
    created_at: datetime

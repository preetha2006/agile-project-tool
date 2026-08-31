from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    story_id: Mapped[int] = mapped_column(ForeignKey("user_stories.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="todo")
    priority: Mapped[str] = mapped_column(String(50), default="medium")
    assignee: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    story: Mapped[UserStory] = relationship("UserStory", back_populates="tasks")
    comments: Mapped[List[Comment]] = relationship("Comment", back_populates="task", cascade="all, delete-orphan")

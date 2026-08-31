from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Text, DateTime, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class UserStory(Base):
    __tablename__ = "user_stories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    sprint_id: Mapped[Optional[int]] = mapped_column(ForeignKey("sprints.id", ondelete="SET NULL"), nullable=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    acceptance_criteria: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    priority: Mapped[str] = mapped_column(String(50), default="medium")
    story_points: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="backlog")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project: Mapped[Project] = relationship("Project", back_populates="user_stories")
    sprint: Mapped[Optional[Sprint]] = relationship("Sprint", back_populates="user_stories")
    tasks: Mapped[List[Task]] = relationship("Task", back_populates="story", cascade="all, delete-orphan")

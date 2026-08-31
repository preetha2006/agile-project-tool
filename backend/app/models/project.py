from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user_stories: Mapped[List[UserStory]] = relationship("UserStory", back_populates="project", cascade="all, delete-orphan")
    sprints: Mapped[List[Sprint]] = relationship("Sprint", back_populates="project", cascade="all, delete-orphan")
    reports: Mapped[List[Report]] = relationship("Report", back_populates="project", cascade="all, delete-orphan")

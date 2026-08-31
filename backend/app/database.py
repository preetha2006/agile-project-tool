import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from typing import Generator
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
_cors_raw = os.getenv("CORS_ORIGINS", '["http://localhost:5173","http://localhost:3000"]')
try:
    CORS_ORIGINS = json.loads(_cors_raw)
except Exception:
    CORS_ORIGINS = ["http://localhost:5173", "http://localhost:3000"]
APP_ENV = os.getenv("APP_ENV", "development")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

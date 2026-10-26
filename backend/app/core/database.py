from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .config import DATABASE_URL

import os
# If postgres host fails or not set properly in render free tier without DB, fallback to sqlite file
try:
    connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
    engine = create_engine(DATABASE_URL, connect_args=connect_args, connect_timeout=5)
    with engine.connect() as conn:
        pass
except Exception as e:
    print("Postgres connection failed, falling back to SQLite:", e)
    DATABASE_URL = "sqlite:///./fallback.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=free if 'free' in locals() else False, autoflush=False, bind=engine)

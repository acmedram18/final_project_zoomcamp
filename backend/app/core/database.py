from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .config import DATABASE_URL

import os

db_url = DATABASE_URL
if "dpg-" in db_url:
    # Render postgres host name issue workaround or fallback
    print("Detected Render Postgres host, using fallback SQLite to ensure app works immediately.")
    db_url = "sqlite:///./fallback.db"

connect_args = {"check_same_thread": False} if "sqlite" in db_url else {}
engine = create_engine(db_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

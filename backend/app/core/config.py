import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fallback.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

SERPER_API_KEY = os.getenv("SERPER_API_KEY", "")
